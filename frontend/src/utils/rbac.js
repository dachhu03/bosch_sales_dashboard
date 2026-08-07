/**
 * Frontend Role-Based Access Control (RBAC) Utility Helpers
 */

export const ROLES = {
  SUPER_ADMIN: 'super_admin',
  PRICE_ADMIN: 'price_admin',
  PRESALES_ADMIN: 'presales_admin',
  VIEWER: 'viewer'
};

export const PERMISSIONS = {
  ADMIN_FULL: 'admin:full',
  RATECARD_READ: 'ratecard:read',
  RATECARD_WRITE: 'ratecard:write',
  RATECARD_PRICE_WRITE: 'ratecard:price_write',
  BOQ_READ: 'boq:read',
  BOQ_WRITE: 'boq:write',
  REPORTS_READ: 'reports:read'
};

/**
 * Checks if the user is a Super Admin
 */
export const isSuperAdmin = (user) => {
  if (!user) return false;
  return user.is_superuser === 1 || user.role === ROLES.SUPER_ADMIN;
};

/**
 * Checks if the user is a Viewer (Read-only)
 */
export const isViewer = (user) => {
  if (!user) return false;
  if (isSuperAdmin(user)) return false;
  return user.role === ROLES.VIEWER;
};

/**
 * Checks if the user has one of the allowed roles
 */
export const hasRole = (user, ...allowedRoles) => {
  if (!user) return false;
  if (isSuperAdmin(user)) return true;
  return allowedRoles.includes(user.role);
};

/**
 * Checks if the user has a specific permission tag
 */
export const hasPermission = (user, requiredPermission) => {
  if (!user) return false;
  if (isSuperAdmin(user)) return true;

  const permissions = Array.isArray(user.permissions) ? user.permissions : [];
  if (permissions.includes(requiredPermission) || permissions.includes('*')) return true;

  // Implicit permission hierarchy
  if (requiredPermission === 'boq:read' && (permissions.includes('boq:write') || permissions.includes('reports:read'))) return true;
  if (requiredPermission === 'ratecard:read' && (permissions.includes('ratecard:write') || permissions.includes('ratecard:price_write'))) return true;

  return false;
};
