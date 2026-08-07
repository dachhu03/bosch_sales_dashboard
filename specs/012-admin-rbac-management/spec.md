# Feature Specification: Admin Management & Role-Based Access Control (RBAC)

**Feature Branch**: `012-admin-rbac-management`  
**Created**: 2026-08-04  
**Status**: Draft  
**Input**: User feature request for dedicated Admin Management module, role-based sidebar visibility, fine-grained user management (create, edit, role/permission assignment, activation/deactivation), predefined roles (Super Admin, Price Admin, Pre-Sales Admin, Viewer), and full frontend + backend RBAC enforcement.

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Role-Based Navigation & Sidebar Control (Priority: P1) 🎯 MVP

As a Super Admin user, I want a dedicated "Admin" option to appear in the navigation sidebar so that I can access user management features. As a non-Super Admin user (Price Admin, Pre-Sales Admin, or Viewer), I want the "Admin" menu item to be hidden completely from my sidebar.

**Why this priority**: Core security and navigation requirement to prevent unauthorized discovery or access to administrative tools.

**Independent Test**: Log in with different role credentials (Super Admin vs Price Admin vs Viewer) and verify sidebar options. Confirm the `/admin` route redirects non-Super Admin users to an unauthorized error page or dashboard.

**Acceptance Scenarios**:
1. **Given** a logged-in user with the `Super Admin` role, **When** viewing the sidebar, **Then** an "Admin" option with a shield/settings icon is rendered.
2. **Given** a logged-in user with any non-Super Admin role (`Price Admin`, `Pre-Sales Admin`, `Viewer`), **When** viewing the sidebar, **Then** the "Admin" option is hidden.
3. **Given** a non-Super Admin user attempts to directly navigate to `/admin` via the URL, **When** the route loads, **Then** access is denied and the user is redirected to `/` with an authorization toast message.

---

### User Story 2 - Admin Management Page & User Operations (Priority: P1) 🎯 MVP

As a Super Admin, I want a comprehensive User Management interface where I can create new user accounts, assign roles from a dropdown, assign multiple permission tags, edit existing user details, and toggle account activation status (Active/Inactive).

**Why this priority**: Essential administrative capability to onboard pre-sales team members and maintain strict security controls over user access.

**Independent Test**: Log in as Super Admin, open `/admin`, create a new user with selected roles and permissions, edit their role, toggle their active status, and verify persistence in backend database.

**Acceptance Scenarios**:
1. **Given** a Super Admin on the Admin Management page, **When** clicking "Add New User", **Then** a modal opens allowing input of username, email, password, role assignment dropdown, and multi-select permission tags.
2. **Given** a Super Admin submits a valid new user form, **When** saved, **Then** the new user appears in the user directory list and can immediately authenticate.
3. **Given** an existing user in the directory, **When** a Super Admin toggles their status to "Inactive", **Then** the user is immediately blocked from logging in or making API requests.
4. **Given** an existing user in the directory, **When** a Super Admin edits their assigned role or permissions, **Then** the changes take effect immediately on next request/token refresh.

---

### User Story 3 - Predefined Role Definitions & Permission Rules (Priority: P1)

As the system administrator, I want 4 standardized predefined roles (`Super Admin`, `Price Admin`, `Pre-Sales Admin`, `Viewer`) with strict authorization boundaries enforced on both the frontend UI and backend REST API endpoints.

**Why this priority**: Protects sensitive pricing data, BOQ calculations, and administrative capabilities according to business authorization rules.

**Independent Test**: Log in under each of the 4 roles and test write operations across Dashboard, Ratecard directory, BOQ Generator, and Reports.

**Acceptance Scenarios**:
1. **Given** a user logged in as `Super Admin`, **When** operating the CRM, **Then** they have unrestricted access to all modules, administrative settings, and write APIs.
2. **Given** a user logged in as `Price Admin`, **When** accessing the application, **Then** they can view/edit ratecard product buying prices and list prices, but cannot access user administration or generate BOQ quotes beyond pricing limits.
3. **Given** a user logged in as `Pre-Sales Admin`, **When** operating the CRM, **Then** they can manage products, build/save BOQs, generate PDF/Excel exports, and view reports, but cannot access user management.
4. **Given** a user logged in as `Viewer (Read-Only User)`, **When** navigating the CRM, **Then** all action buttons (Add Product, Upload Sheet, Wipe Catalog, Save BOQ, Delete Quote, Edit Cell) are disabled/hidden, and write API requests return `403 Forbidden`.

---

### User Story 4 - End-to-End RBAC Security & Non-Regression (Priority: P2)

As a pre-sales team member, I want all existing CRM capabilities (BOQ calculations, Excel sheet uploads, report exports, theme toggles) to function seamlessly without performance degradation, console errors, or broken security contracts.

**Why this priority**: Guarantees zero regression for existing users while adding robust RBAC security layers.

**Independent Test**: Perform standard pre-sales workflows under permissible roles and verify zero side-effect errors or broken state.

**Acceptance Scenarios**:
1. **Given** an existing valid user session, **When** performing standard BOQ generation or Ratecard browsing, **Then** all features execute cleanly with full backward compatibility.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide a dedicated Admin Management page (`/admin`) accessible strictly to users with the `Super Admin` role.
- **FR-002**: Sidebar navigation MUST render an "Admin" item ONLY when the authenticated user possesses the `Super Admin` role.
- **FR-003**: Admin Management module MUST support:
  - Creating new users (Username, Email, Password, Role, Permissions).
  - Editing existing user details, roles, and granular permissions.
  - Activating or deactivating user accounts (Active status toggle).
  - Assigning roles via a single-select dropdown.
  - Assigning permissions via a multi-select dropdown.
- **FR-004**: System MUST define and enforce 4 core predefined roles:
  1. `Super Admin`: Full system access, user management, and all API endpoints.
  2. `Price Admin`: Access to manage product list prices, buying prices, and ratecard rules.
  3. `Pre-Sales Admin`: Access to manage products, create/save BOQs, and view reports.
  4. `Viewer`: Read-only access across all views. All create, edit, delete, upload, and update actions are disabled and blocked.
- **FR-005**: Backend REST API MUST enforce role and permission checks on all mutation endpoints (`POST`, `PUT`, `DELETE`, `PATCH`). Unpermitted requests MUST return `403 Forbidden`.
- **FR-006**: Frontend UI MUST enforce permission checks on interactive elements (hide/disable edit cells, add buttons, upload buttons, save buttons for `Viewer` role).
- **FR-007**: Deactivated users MUST be blocked from logging in and their active API requests MUST be rejected immediately.

### Key Entities

- **User**: Represents an application user account containing `id`, `username`, `email`, `role`, `permissions` (array), `is_active` (boolean), `is_superuser` (boolean), `created_at`, `updated_at`.
- **Role**: Enum/String entity defining user authority levels (`super_admin`, `price_admin`, `presales_admin`, `viewer`).
- **Permission**: Granular feature action strings (e.g., `ratecard:read`, `ratecard:write`, `boq:read`, `boq:write`, `reports:read`, `admin:full`).

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of non-Super Admin users are blocked from seeing the Admin sidebar link or accessing `/admin` endpoints.
- **SC-002**: Users with the `Viewer` role cannot execute any write/edit/delete/upload action across the entire CRM (0 unauthorized write mutations allowed).
- **SC-003**: Super Admins can create, edit, and deactivate user accounts in under 5 seconds per operation.
- **SC-004**: 100% backward compatibility maintained for existing pre-sales workflows with 0 console or API authorization errors.
