# Implementation Plan: Admin Management & Role-Based Access Control (RBAC)

**Branch**: `012-admin-rbac-management`  
**Feature Directory**: `specs/012-admin-rbac-management`  
**Created**: 2026-08-04  
**Status**: In Progress  

---

## Technical Context

The application currently authenticates users using JWT and Supabase Auth with profile mapping stored in the `auth_user` table (or local user profile store). User profiles include basic flags (`is_staff`, `is_superuser`).

To implement the new **Admin Management & RBAC** feature:
1. **Database Schema Extensions**:
   - Extend `auth_user` table (or associated user profiles) with:
     - `role`: Enum/String (`super_admin`, `price_admin`, `presales_admin`, `viewer`).
     - `permissions`: JSON array or comma-separated permission strings.
     - `is_active`: Integer/Boolean flag (1 for active, 0 for inactive/blocked).
2. **Predefined Role Matrix**:
   - `super_admin`: Full access to all modules and system settings (`*` / `admin:full`).
   - `price_admin`: Can manage product pricing and buying prices (`ratecard:read`, `ratecard:price_write`).
   - `presales_admin`: Can manage products, BOQs, reports, and pre-sales operations (`ratecard:read`, `ratecard:write`, `boq:read`, `boq:write`, `reports:read`).
   - `viewer`: Read-only access (`ratecard:read`, `boq:read`, `reports:read`). All create/edit/delete/upload actions disabled.
3. **Backend Middleware & REST Endpoints**:
   - Create `backend/middleware/rbac.js` providing `requireRole(...)` and `requirePermission(...)`.
   - Create `backend/routes/admin.js` for Super Admin operations:
     - `GET /api/admin/users`: List all users with roles, permissions, and active status.
     - `POST /api/admin/users`: Create new user.
     - `PUT /api/admin/users/:id`: Edit user role, permissions, and details.
     - `PATCH /api/admin/users/:id/status`: Toggle user activation status (`is_active`).
     - `GET /api/admin/roles-permissions`: Retrieve available predefined roles and permission catalog.
4. **Frontend UI & Access Control**:
   - Update `AuthContext` to include `role`, `permissions`, and helper checks (`hasRole`, `hasPermission`, `isSuperAdmin`, `isViewer`).
   - Add `/admin` route in `App.jsx` protected by `<ProtectedRoute requiredRole="super_admin">`.
   - Add conditional "Admin" navigation menu link in `Sidebar.jsx` visible ONLY when `user.role === 'super_admin'` (or `user.is_superuser === 1`).
   - Create `AdminManagement.jsx` page component:
     - Directory table listing all users with active status badges, role badges, and action dropdowns.
     - Modal for Creating/Editing Users with Role select dropdown and Permission multi-select tag picker.
     - Active/Inactive toggle switch.
   - Enforce read-only UI states across `Dashboard.jsx`, `Ratecard.jsx`, `BOQGenerator.jsx`, and `Reports.jsx` for the `viewer` role (disable/hide add buttons, edit inputs, upload sheet buttons, save quote buttons, delete buttons).

---

## Constitution Check

- **Preserve Existing Functionality**: Existing authentication pathways and user logins must continue working smoothly without regression.
- **Strict Layering**: Security enforcement must occur on BOTH frontend (UI elements, routing) and backend (Express middleware, route handlers).
- **Clean Architecture**: Decouple role/permission middleware from specific route handlers for reusability across all modules.

---

## Phase 0: Research & Technical Decisions

See [`research.md`](./research.md) for full architectural analysis:
- **Decision**: DB schema adaptation for `auth_user` with `role`, `permissions` (JSON array string), and `is_active` fields.
- **Decision**: Express middleware `requireRole` and `requirePermission` checking req.user against token/database claims.
- **Decision**: Single-select role picker with pre-populated permissions and multi-select permission tag overrides.

---

## Phase 1: Design & Contracts

Generated design artifacts:
- [`data-model.md`](./data-model.md): Detailed user entity schema, role matrix, permission catalog, and state transitions.
- [`contracts/admin-rbac-contract.md`](./contracts/admin-rbac-contract.md): REST API contracts for Admin Management and error responses.
- [`quickstart.md`](./quickstart.md): Scenarios to validate Super Admin, Price Admin, Pre-Sales Admin, and Viewer access controls.
