import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';
import supabase from '../utils/supabase.js';

const router = Router();

// Helper to create an isolated ephemeral auth client so Supabase Auth operations
// do not mutate the session or authorization headers of the global database client instance.
function getAuthClient() {
  return createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false
    }
  });
}

// Middleware to verify Auth Token & attach user profile
export const verifyToken = async (req, res, next) => {
  const token = req.cookies.token || req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ status: 'error', message: 'No authentication token provided.' });
  }

  let userEmail = null;
  let username = null;
  let userId = null;

  try {
    // 1. Try Supabase Auth token verification first using an isolated client
    const authClient = getAuthClient();
    const { data: { user: supabaseUser }, error } = await authClient.auth.getUser(token);
    if (!error && supabaseUser) {
      userId = supabaseUser.id;
      userEmail = supabaseUser.email;
      username = supabaseUser.email ? supabaseUser.email.split('@')[0] : 'user';
    }
  } catch (sbErr) {}

  if (!userId) {
    try {
      // 2. Try signed JWT verification
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');
      userId = decoded.userId;
      username = decoded.username;
      userEmail = decoded.email;
    } catch (jwtErr) {
      return res.status(401).json({ status: 'error', message: 'Invalid or expired token.' });
    }
  }

  req.userId = userId;
  req.username = username;
  req.userEmail = userEmail;

  // Attach full profile (role, permissions, active status)
  try {
    let query = supabase.from('auth_user').select('id, username, email, role, permissions, is_active, is_staff, is_superuser');
    if (userEmail) query = query.eq('email', userEmail);
    else if (username) query = query.eq('username', username);
    else if (typeof userId === 'number') query = query.eq('id', userId);

    const { data: profiles } = await query.limit(1);
    const profile = profiles && profiles[0];

    const userRole = profile?.is_superuser === 1 ? 'super_admin' : (profile?.role || 'presales_admin');
    let userPermissions = [];
    if (userRole === 'super_admin') {
      userPermissions = ['*'];
    } else if (profile?.permissions) {
      userPermissions = typeof profile.permissions === 'string' ? JSON.parse(profile.permissions) : profile.permissions;
    } else {
      userPermissions = ['ratecard:read', 'ratecard:write', 'boq:read', 'boq:write', 'reports:read'];
    }

    req.user = {
      id: profile?.id || userId,
      username: profile?.username || username,
      email: profile?.email || userEmail,
      role: userRole,
      permissions: userPermissions,
      is_active: profile?.is_active ?? 1,
      is_staff: profile?.is_staff ?? 1,
      is_superuser: profile?.is_superuser ?? (userRole === 'super_admin' ? 1 : 0)
    };

    if (req.user.is_active === 0) {
      return res.status(403).json({ status: 'error', message: 'Account is deactivated. Access denied.' });
    }
  } catch (err) {
    req.user = {
      id: userId,
      username,
      email: userEmail,
      role: 'presales_admin',
      permissions: ['ratecard:read', 'ratecard:write', 'boq:read', 'boq:write', 'reports:read'],
      is_active: 1,
      is_staff: 1,
      is_superuser: 0
    };
  }

  return next();
};

// Verifies legacy Django pbkdf2_sha256 password hash if present in auth_user
function verifyDjangoPassword(password, djangoHash) {
  try {
    const parts = djangoHash.split('$');
    if (parts.length !== 4) return false;
    
    const algorithm = parts[0];
    const iterations = parseInt(parts[1], 10);
    const salt = parts[2];
    const hash = parts[3];

    if (algorithm !== 'pbkdf2_sha256') return false;

    const derivedKey = crypto.pbkdf2Sync(password, salt, iterations, 32, 'sha256');
    return derivedKey.toString('base64') === hash;
  } catch (err) {
    return false;
  }
}

// POST login - Clean Production Architecture (Supabase Auth Primary + Profile Role Lookup)
router.post('/login', async (req, res) => {
  const { email, username, password } = req.body;
  const userIdentifier = (email || username || '').trim();

  if (!userIdentifier || !password) {
    return res.status(400).json({ status: 'error', message: 'Username/Email and password are required.' });
  }

  try {
    let authenticatedUser = null;
    let token = null;

    // 1. Primary: Supabase Auth handles login & password verification via isolated auth client
    if (userIdentifier.includes('@')) {
      try {
        const authClient = getAuthClient();
        const { data: authData, error: sbErr } = await authClient.auth.signInWithPassword({
          email: userIdentifier,
          password
        });

        if (authData?.user && !sbErr) {
          authenticatedUser = {
            supabase_uid: authData.user.id,
            email: authData.user.email,
            username: authData.user.email.split('@')[0]
          };
          token = authData.session?.access_token;
        }
      } catch (err) {}
    }

    // 2. Secondary: Fallback to auth_user table profile check (for unconfirmed emails or legacy DB accounts)
    if (!authenticatedUser) {
      const { data: users } = await supabase
        .from('auth_user')
        .select('*')
        .or(`username.eq.${userIdentifier},email.eq.${userIdentifier}`)
        .limit(1);

      const dbUser = users && users[0];
      if (dbUser) {
        let isMatch = false;
        if (dbUser.password && dbUser.password.startsWith('pbkdf2_')) {
          isMatch = verifyDjangoPassword(password, dbUser.password);
        } else if (dbUser.password) {
          isMatch = await bcrypt.compare(password, dbUser.password);
        }

        if (isMatch) {
          authenticatedUser = {
            id: dbUser.id,
            username: dbUser.username,
            email: dbUser.email || dbUser.username
          };
        }
      }
    }

    if (!authenticatedUser) {
      return res.status(401).json({ status: 'error', message: 'Invalid username/email or password.' });
    }

    // 3. Fetch or auto-provision business profile (roles, permissions) from auth_user
    let profile = null;
    if (authenticatedUser.email) {
      const { data: profiles } = await supabase
        .from('auth_user')
        .select('id, username, email, is_staff, is_superuser, role, permissions, is_active, first_name, last_name')
        .eq('email', authenticatedUser.email)
        .limit(1);

      profile = profiles && profiles[0];
    } else if (authenticatedUser.username) {
      const { data: profiles } = await supabase
        .from('auth_user')
        .select('id, username, email, is_staff, is_superuser, role, permissions, is_active, first_name, last_name')
        .eq('username', authenticatedUser.username)
        .limit(1);

      profile = profiles && profiles[0];
    }

    if (!profile && authenticatedUser.email) {
      const defaultPass = await bcrypt.hash(password, 10);
      const { data: inserted } = await supabase
        .from('auth_user')
        .insert([{
          username: authenticatedUser.username || authenticatedUser.email.split('@')[0],
          email: authenticatedUser.email,
          password: defaultPass,
          role: 'presales_admin',
          permissions: JSON.stringify(['ratecard:read', 'ratecard:write', 'boq:read', 'boq:write', 'reports:read']),
          is_staff: 1,
          is_superuser: 0,
          is_active: 1,
          date_joined: new Date().toISOString()
        }])
        .select();
      profile = inserted && inserted[0];
    }

    // Check account status
    const isActive = profile?.is_active ?? 1;
    if (isActive === 0) {
      return res.status(403).json({ status: 'error', message: 'Account is deactivated. Contact system administrator.' });
    }

    // Determine computed role & permissions array
    const userRole = profile?.is_superuser === 1 ? 'super_admin' : (profile?.role || 'presales_admin');
    let userPermissions = [];
    if (userRole === 'super_admin') {
      userPermissions = ['*'];
    } else if (profile?.permissions) {
      userPermissions = typeof profile.permissions === 'string' ? JSON.parse(profile.permissions) : profile.permissions;
    } else {
      userPermissions = ['ratecard:read', 'ratecard:write', 'boq:read', 'boq:write', 'reports:read'];
    }

    const userPayload = {
      id: profile?.id || authenticatedUser.id,
      supabase_uid: authenticatedUser.supabase_uid,
      username: profile?.username || authenticatedUser.username,
      email: authenticatedUser.email,
      role: userRole,
      permissions: userPermissions,
      is_active: isActive,
      is_staff: profile?.is_staff ?? 1,
      is_superuser: profile?.is_superuser ?? (userRole === 'super_admin' ? 1 : 0)
    };

    if (!token) {
      token = jwt.sign(
        { userId: userPayload.id, username: userPayload.username, email: userPayload.email, role: userPayload.role },
        process.env.JWT_SECRET || 'fallback-secret',
        { expiresIn: '24h' }
      );
    }

    // Save token to HTTP-only cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    });

    return res.json({
      status: 'success',
      message: 'Login successful.',
      user: userPayload,
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ status: 'error', message: 'Server error during authentication.' });
  }
});

// POST logout
router.post('/logout', async (req, res) => {
  try {
    const authClient = getAuthClient();
    await authClient.auth.signOut();
  } catch (err) {}
  res.clearCookie('token');
  return res.json({ status: 'success', message: 'Logged out successfully.' });
});

// GET validate session status & return business profile
router.get('/validate', verifyToken, async (req, res) => {
  try {
    let query = supabase.from('auth_user').select('id, username, email, role, permissions, is_active, is_staff, is_superuser, first_name, last_name');

    if (req.userEmail) {
      query = query.eq('email', req.userEmail);
    } else if (req.username) {
      query = query.eq('username', req.username);
    } else if (req.userId && typeof req.userId === 'number') {
      query = query.eq('id', req.userId);
    }

    const { data: profiles } = await query.limit(1);

    const profile = profiles && profiles[0];

    const userRole = profile?.is_superuser === 1 ? 'super_admin' : (profile?.role || 'presales_admin');
    let userPermissions = [];
    if (userRole === 'super_admin') {
      userPermissions = ['*'];
    } else if (profile?.permissions) {
      userPermissions = typeof profile.permissions === 'string' ? JSON.parse(profile.permissions) : profile.permissions;
    } else {
      userPermissions = ['ratecard:read', 'ratecard:write', 'boq:read', 'boq:write', 'reports:read'];
    }

    const userPayload = {
      id: profile?.id || req.userId,
      username: profile?.username || req.username || (req.userEmail ? req.userEmail.split('@')[0] : 'user'),
      email: profile?.email || req.userEmail,
      role: userRole,
      permissions: userPermissions,
      is_active: profile?.is_active ?? 1,
      is_staff: profile?.is_staff ?? 1,
      is_superuser: profile?.is_superuser ?? (userRole === 'super_admin' ? 1 : 0)
    };

    if (userPayload.is_active === 0) {
      return res.status(403).json({ status: 'error', message: 'Account is deactivated.' });
    }

    return res.json({ status: 'success', user: userPayload });
  } catch (error) {
    console.error('Validate session exception:', error);
    return res.status(500).json({ status: 'error', message: 'Server validation error.' });
  }
});

export default router;
