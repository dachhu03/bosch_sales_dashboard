import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../App.jsx';

/**
 * Route protection wrapper component to enforce role & permission checks.
 */
export default function ProtectedRoute({ children, requiredRole, requiredPermission }) {
  const { user, isSuperAdmin, hasRole, hasPermission } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Deactivated user check fallback
  if (user.is_active === 0) {
    return <Navigate to="/login" replace />;
  }

  // Super Admin bypass
  if (isSuperAdmin && isSuperAdmin()) {
    return children;
  }

  // Check required role
  if (requiredRole && hasRole && !hasRole(requiredRole)) {
    return <Navigate to="/" replace />;
  }

  // Check required permission
  if (requiredPermission && hasPermission && !hasPermission(requiredPermission)) {
    return <Navigate to="/" replace />;
  }

  return children;
}
