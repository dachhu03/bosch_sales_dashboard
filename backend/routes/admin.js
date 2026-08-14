import { Router } from 'express';
import bcrypt from 'bcryptjs';
import supabase from '../utils/supabase.js';
import { verifyToken } from './auth.js';
import { requireRole } from '../middleware/rbac.js';

const router = Router();

// Apply auth & Super Admin role restriction to all /api/admin routes
router.use(verifyToken, requireRole('super_admin'));

// Role & Permission Definitions Reference Map
const ROLE_PERMISSIONS_MAP = {
  super_admin: [
    'admin:full',
    'ratecard:read',
    'ratecard:write',
    'ratecard:price_write',
    'boq:read',
    'boq:write',
    'reports:read'
  ],
  price_admin: [
    'ratecard:read',
    'ratecard:price_write'
  ],
  presales_admin: [
    'ratecard:read',
    'ratecard:write',
    'boq:read',
    'boq:write',
    'reports:read'
  ],
  viewer: [
    'ratecard:read',
    'boq:read',
    'reports:read'
  ]
};

const PERMISSION_CATALOG = [
  { key: 'admin:full', label: 'Admin Full Access', description: 'Full access to User Management and system settings' },
  { key: 'ratecard:read', label: 'Ratecard View', description: 'View ratecard items and directory search' },
  { key: 'ratecard:write', label: 'Ratecard Edit Products', description: 'Add products, edit non-price metadata, upload bulk sheets' },
  { key: 'ratecard:price_write', label: 'Ratecard Pricing Edit', description: 'Edit buying prices, list prices, and global discounts' },
  { key: 'boq:read', label: 'BOQ View', description: 'View BOQ Generator quotes and saved summaries' },
  { key: 'boq:write', label: 'BOQ Build & Edit', description: 'Build, edit, save, and delete BOQ quotations' },
  { key: 'reports:read', label: 'Reports & Analytics', description: 'View analytics dashboard and sales reports' }
];

// GET /api/admin/roles-permissions - Return roles and permission catalog
router.get('/roles-permissions', (req, res) => {
  return res.json({
    status: 'success',
    data: {
      rolePermissionsMap: ROLE_PERMISSIONS_MAP,
      permissionCatalog: PERMISSION_CATALOG
    }
  });
});

// GET /api/admin/users - List all users
router.get('/users', async (req, res) => {
  try {
    const { data: users, error } = await supabase
      .from('auth_user')
      .select('id, username, email, role, permissions, is_active, is_staff, is_superuser, date_joined')
      .order('id', { ascending: true });

    if (error) {
      console.error('Error fetching users from Supabase:', error);
      return res.status(500).json({ status: 'error', message: 'Failed to retrieve user list.' });
    }

    const formattedUsers = (users || []).map(u => ({
      ...u,
      role: u.is_superuser === 1 ? 'super_admin' : (u.role || 'presales_admin'),
      permissions: typeof u.permissions === 'string' ? JSON.parse(u.permissions) : (u.permissions || [])
    }));

    return res.json({
      status: 'success',
      data: {
        users: formattedUsers
      }
    });
  } catch (err) {
    console.error('List users exception:', err);
    return res.status(500).json({ status: 'error', message: 'Server error retrieving users.' });
  }
});

// POST /api/admin/users - Create new user account
router.post('/users', async (req, res) => {
  const { username, email, password, role, permissions } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ status: 'error', message: 'Username, email, and password are required.' });
  }

  try {
    // Check if username or email already exists
    const { data: existing } = await supabase
      .from('auth_user')
      .select('id')
      .or(`username.eq.${username.trim()},email.eq.${email.trim()}`)
      .limit(1);

    if (existing && existing.length > 0) {
      return res.status(400).json({ status: 'error', message: 'A user with that username or email already exists.' });
    }

    const assignedRole = role || 'presales_admin';
    const assignedPermissions = Array.isArray(permissions) 
      ? permissions 
      : (ROLE_PERMISSIONS_MAP[assignedRole] || ROLE_PERMISSIONS_MAP.presales_admin);

    const hashedPassword = await bcrypt.hash(password, 10);
    const isSuperuser = assignedRole === 'super_admin' ? 1 : 0;

    const { data: inserted, error } = await supabase
      .from('auth_user')
      .insert([{
        username: username.trim(),
        email: email.trim(),
        password: hashedPassword,
        role: assignedRole,
        permissions: JSON.stringify(assignedPermissions),
        is_active: 1,
        is_staff: 1,
        is_superuser: isSuperuser,
        date_joined: new Date().toISOString()
      }])
      .select('id, username, email, role, permissions, is_active, is_staff, is_superuser, date_joined');

    if (error || !inserted || inserted.length === 0) {
      console.error('Create user insertion error:', error);
      return res.status(500).json({ status: 'error', message: 'Failed to create user account.' });
    }

    const createdUser = inserted[0];
    createdUser.permissions = typeof createdUser.permissions === 'string' ? JSON.parse(createdUser.permissions) : createdUser.permissions;

    return res.status(201).json({
      status: 'success',
      message: 'User created successfully.',
      data: {
        user: createdUser
      }
    });
  } catch (err) {
    console.error('Create user exception:', err);
    return res.status(500).json({ status: 'error', message: 'Server error creating user.' });
  }
});

// PUT /api/admin/users/:id - Update user details, role, and permissions
router.put('/users/:id', async (req, res) => {
  const userId = parseInt(req.params.id, 10);
  const { username, email, role, permissions, password } = req.body;

  if (isNaN(userId)) {
    return res.status(400).json({ status: 'error', message: 'Invalid user ID.' });
  }

  try {
    const updatePayload = {};
    if (username) updatePayload.username = username.trim();
    if (email) updatePayload.email = email.trim();

    if (role) {
      updatePayload.role = role;
      updatePayload.is_superuser = role === 'super_admin' ? 1 : 0;
    }

    if (permissions !== undefined) {
      updatePayload.permissions = JSON.stringify(Array.isArray(permissions) ? permissions : []);
    }

    if (password && password.trim()) {
      updatePayload.password = await bcrypt.hash(password.trim(), 10);
    }

    const { data: updated, error } = await supabase
      .from('auth_user')
      .update(updatePayload)
      .eq('id', userId)
      .select('id, username, email, role, permissions, is_active, is_staff, is_superuser');

    if (error) {
      console.error('Update user database error:', error);
      return res.status(500).json({ status: 'error', message: 'Failed to update user.' });
    }

    return res.json({
      status: 'success',
      message: 'User updated successfully.',
      data: {
        user: updated && updated[0] ? {
          ...updated[0],
          permissions: typeof updated[0].permissions === 'string' ? JSON.parse(updated[0].permissions) : updated[0].permissions
        } : null
      }
    });
  } catch (err) {
    console.error('Update user exception:', err);
    return res.status(500).json({ status: 'error', message: 'Server error updating user.' });
  }
});

// PATCH /api/admin/users/:id/status - Toggle user active status
router.patch('/users/:id/status', async (req, res) => {
  const userId = parseInt(req.params.id, 10);
  const { is_active } = req.body;

  if (isNaN(userId) || typeof is_active !== 'number') {
    return res.status(400).json({ status: 'error', message: 'Invalid payload. "is_active" status must be 0 or 1.' });
  }

  try {
    const { error } = await supabase
      .from('auth_user')
      .update({ is_active })
      .eq('id', userId);

    if (error) {
      console.error('Toggle status error:', error);
      return res.status(500).json({ status: 'error', message: 'Failed to update account status.' });
    }

    return res.json({
      status: 'success',
      message: `User account status updated to ${is_active === 1 ? 'Active' : 'Inactive'}.`
    });
  } catch (err) {
    console.error('Toggle status exception:', err);
    return res.status(500).json({ status: 'error', message: 'Server error updating account status.' });
  }
});

// DELETE /api/admin/users/:id - Delete user account
router.delete('/users/:id', async (req, res) => {
  const paramId = req.params.id;

  if (!paramId || paramId === 'undefined' || paramId === 'null') {
    return res.status(400).json({ status: 'error', message: 'Invalid user ID provided.' });
  }

  // Prevent self-deletion of currently logged-in active admin account
  if (req.user && String(req.user.id) === String(paramId)) {
    return res.status(400).json({ status: 'error', message: 'Cannot delete your own active administrator account.' });
  }

  try {
    const numericId = parseInt(paramId, 10);

    // Try deleting matching numeric ID or string ID
    let deleteQuery = supabase.from('auth_user').delete();
    if (!isNaN(numericId)) {
      deleteQuery = deleteQuery.or(`id.eq.${numericId},id.eq.${paramId}`);
    } else {
      deleteQuery = deleteQuery.eq('id', paramId);
    }

    const { error } = await deleteQuery;

    if (error) {
      console.error('Delete user database error:', error);
      return res.status(500).json({ status: 'error', message: error.message || 'Failed to delete user account.' });
    }

    return res.json({
      status: 'success',
      message: 'User account deleted successfully.'
    });
  } catch (err) {
    console.error('Delete user exception:', err);
    return res.status(500).json({ status: 'error', message: 'Server error deleting user account.' });
  }
});

// GET /api/admin/notifications - List notification logs and pending review BOQs
router.get('/notifications', async (req, res) => {
  try {
    const { data: logs, error: logsErr } = await supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);

    const { data: boqs, error: boqsErr } = await supabase
      .from('exapp_boq')
      .select('id, project_name, project_location, quotation_number, solution_title, totals, created_at')
      .order('created_at', { ascending: false });

    if (logsErr && !logs) {
      console.warn('Fetch notifications warning:', logsErr.message);
    }

    const formattedNotifications = (logs || []).map(n => ({
      id: n.id,
      boqId: n.boq_id,
      eventId: n.event_id,
      recipient: n.recipient,
      notificationType: n.notification_type,
      status: n.status,
      sentAt: n.sent_at,
      createdAt: n.created_at,
      errorMessage: n.error_message
    }));

    const formattedBoqs = (boqs || []).map(b => {
      let totals = {};
      try {
        totals = typeof b.totals === 'string' ? JSON.parse(b.totals) : (b.totals || {});
      } catch (e) {
        totals = {};
      }
      return {
        id: b.id,
        projectName: b.project_name,
        projectLocation: b.project_location,
        quotationNumber: b.quotation_number,
        solutionTitle: b.solution_title,
        preparedBy: totals.preparedBy || 'Sales Member',
        salesTotal: parseFloat(totals.grandTotalSales || totals.grand_sales_total) || 0,
        reviewStatus: totals.reviewStatus || 'DRAFT',
        reviewRemarks: totals.reviewRemarks || '',
        createdAt: b.created_at,
        updatedAt: totals.updatedAt || b.created_at
      };
    });

    const pendingCount = formattedBoqs.filter(b => b.reviewStatus === 'PENDING_REVIEW' || b.reviewStatus === 'IN_REVIEW').length;

    return res.json({
      status: 'success',
      data: {
        notifications: formattedNotifications,
        boqs: formattedBoqs,
        pendingCount
      }
    });
  } catch (err) {
    console.error('Fetch admin notifications exception:', err);
    return res.status(500).json({ status: 'error', message: 'Failed to retrieve notification logs.' });
  }
});

// PATCH /api/admin/boq/:id/review - Update internal review status & review remarks (Super Admin only)
router.patch('/boq/:id/review', async (req, res) => {
  const { id } = req.params;
  const { review_status, reviewStatus, review_remarks, reviewRemarks } = req.body;

  const targetStatus = review_status || reviewStatus;
  const targetRemarks = review_remarks !== undefined ? review_remarks : reviewRemarks;

  const validStatuses = ['DRAFT', 'PENDING_REVIEW', 'IN_REVIEW', 'APPROVED', 'REJECTED'];
  if (targetStatus && !validStatuses.includes(targetStatus.toUpperCase())) {
    return res.status(400).json({
      status: 'error',
      message: `Invalid review status. Must be one of: ${validStatuses.join(', ')}`
    });
  }

  try {
    const { data: rows, error: fetchErr } = await supabase
      .from('exapp_boq')
      .select('totals')
      .eq('id', parseInt(id));

    if (fetchErr || !rows || !rows.length) {
      return res.status(404).json({ status: 'error', message: 'BOQ solution quote not found.' });
    }

    let currentTotals = {};
    try {
      currentTotals = typeof rows[0].totals === 'string' ? JSON.parse(rows[0].totals) : (rows[0].totals || {});
    } catch (e) {
      currentTotals = {};
    }

    const normalizedStatus = targetStatus ? targetStatus.toUpperCase() : (currentTotals.reviewStatus || 'PENDING_REVIEW');
    const finalRemarks = targetRemarks !== undefined ? String(targetRemarks).trim() : (currentTotals.reviewRemarks || '');

    // Synchronize Report status automatically from Super Admin Internal Review Status
    let reportStatus = 'In Review';
    if (normalizedStatus === 'APPROVED') reportStatus = 'Closed';
    else if (normalizedStatus === 'REJECTED') reportStatus = 'Rejected';
    else if (normalizedStatus === 'IN_REVIEW' || normalizedStatus === 'PENDING_REVIEW') reportStatus = 'In Review';

    const updatedTotals = {
      ...currentTotals,
      reviewStatus: normalizedStatus,
      reviewRemarks: finalRemarks,
      remarks: finalRemarks,
      notes: finalRemarks,
      approvalStatus: reportStatus,
      updatedAt: new Date().toISOString()
    };

    const updatePayload = {
      totals: updatedTotals
    };

    const { error: updateErr } = await supabase
      .from('exapp_boq')
      .update(updatePayload)
      .eq('id', parseInt(id));

    if (updateErr) {
      console.error('Update BOQ review error:', updateErr);
      return res.status(500).json({ status: 'error', message: 'Failed to update BOQ review status.' });
    }

    return res.json({
      status: 'success',
      message: 'BOQ review status updated successfully.',
      data: {
        id: parseInt(id),
        reviewStatus: normalizedStatus,
        reviewRemarks: finalRemarks
      }
    });
  } catch (err) {
    console.error('Update BOQ review exception:', err);
    return res.status(500).json({ status: 'error', message: 'Failed to update BOQ review status.' });
  }
});

export default router;
