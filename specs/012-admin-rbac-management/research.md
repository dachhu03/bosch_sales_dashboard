# Technical Research & Architectural Decisions: Admin Management & RBAC

**Feature**: Admin Management & Role-Based Access Control (RBAC)  
**Feature Directory**: `specs/012-admin-rbac-management`  

---

## 1. Role-Based Access Control (RBAC) Design

### Decision: Dual-Layer (Role + Granular Permissions) Architecture

**Context**: The application requires 4 predefined roles (`Super Admin`, `Price Admin`, `Pre-Sales Admin`, `Viewer`), plus fine-grained permission assignments per user.

**Rationale**:
- **Roles** provide coarse-grained authorization suitable for standard user onboarding (e.g. assigning `Pre-Sales Admin` automatically grants standard BOQ and product privileges).
- **Permissions** provide fine-grained overrides when a Super Admin needs to grant or restrict specific actions (e.g., granting a Viewer temporary permission to edit buying prices, or granting a Pre-Sales Admin permission to access financial reports).

### Predefined Role & Permission Matrix

| Role | Role Identifier | Granted Permissions | Description |
|---|---|---|---|
| **Super Admin** | `super_admin` | `*` (`admin:full`) | Complete system authority, user onboarding, role/permission management, system settings. |
| **Price Admin** | `price_admin` | `ratecard:read`, `ratecard:price_write` | Authority to view ratecards and edit product buying/list prices. |
| **Pre-Sales Admin** | `presales_admin` | `ratecard:read`, `ratecard:write`, `boq:read`, `boq:write`, `reports:read` | Authority to manage product catalog, build/save BOQ quotes, export PDF/Excel, view reports. |
| **Viewer** | `viewer` | `ratecard:read`, `boq:read`, `reports:read` | Read-only access across all views. All mutation actions (create, edit, delete, upload, save) blocked. |

---

## 2. Backend Security Enforcement

### Decision: Middleware-Based Protection (`requireRole`, `requirePermission`)

**Context**: Restricting Express routes based on user role and permissions without hardcoding access checks inside route handlers.

**Implementation Pattern**:
```javascript
// backend/middleware/rbac.js
export const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ status: 'error', message: 'Authentication required.' });
    }
    
    // Super Admin override or role match
    if (req.user.role === 'super_admin' || req.user.is_superuser === 1 || allowedRoles.includes(req.user.role)) {
      return next();
    }
    
    return res.status(403).json({ status: 'error', message: 'Access denied. Insufficient role permissions.' });
  };
};

export const requirePermission = (permission) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ status: 'error', message: 'Authentication required.' });
    }
    
    if (req.user.role === 'super_admin' || req.user.is_superuser === 1) {
      return next();
    }
    
    const userPermissions = Array.isArray(req.user.permissions) ? req.user.permissions : [];
    if (userPermissions.includes(permission) || userPermissions.includes('*')) {
      return next();
    }
    
    return res.status(403).json({ status: 'error', message: `Access denied. Required permission: ${permission}` });
  };
};
```

---

## 3. Frontend UI Access Control

### Decision: Role & Permission Context Hooks (`useAuth`)

**Context**: Conditional rendering of sidebar links, action buttons, table cell editors, and route protection.

**Implementation Pattern**:
- `user.role === 'super_admin'` controls visibility of the "Admin" sidebar menu link.
- `user.role === 'viewer'` disables table editing in `EditableCell.jsx`, hides "Add Item", "Upload Sheet", "Wipe Catalog" in `Ratecard.jsx`, and disables "Save BOQ" in `BOQGenerator.jsx`.
- `<ProtectedRoute requiredRole="super_admin">` guards `/admin` route navigation.
