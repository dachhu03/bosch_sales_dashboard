/**
 * Role-Based Access Control (RBAC) Express Middleware
 */

// Middleware to enforce specific roles (e.g. 'super_admin', 'price_admin')
export const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ status: 'error', message: 'Authentication required.' });
    }

    const { role, is_superuser } = req.user;

    // Super Admin override or matching allowed role
    if (is_superuser === 1 || role === 'super_admin' || allowedRoles.includes(role)) {
      return next();
    }

    return res.status(403).json({
      status: 'error',
      message: `Access denied. Requires one of the following roles: ${allowedRoles.join(', ')}`
    });
  };
};

// Middleware to enforce specific permissions (e.g. 'ratecard:price_write', 'boq:write')
export const requirePermission = (...requiredPermissions) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ status: 'error', message: 'Authentication required.' });
    }

    const { role, is_superuser, permissions } = req.user;

    // Super Admin override
    if (is_superuser === 1 || role === 'super_admin') {
      return next();
    }

    const userPermissions = Array.isArray(permissions) ? permissions : [];

    // Check wildcard '*' or matching permission
    if (userPermissions.includes('*')) {
      return next();
    }

    const hasMatch = requiredPermissions.some(perm => {
      if (userPermissions.includes(perm)) return true;
      // Implicit permissions hierarchy
      if (perm === 'boq:read' && (userPermissions.includes('boq:write') || userPermissions.includes('reports:read'))) return true;
      if (perm === 'ratecard:read' && (userPermissions.includes('ratecard:write') || userPermissions.includes('ratecard:price_write'))) return true;
      return false;
    });

    if (hasMatch) {
      return next();
    }

    return res.status(403).json({
      status: 'error',
      message: `Access denied. Required permission: ${requiredPermissions.join(' or ')}`
    });
  };
};
