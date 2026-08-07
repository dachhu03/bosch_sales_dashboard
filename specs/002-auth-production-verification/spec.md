# Feature Specification: Authentication Production Verification & Enterprise Architecture

**Feature Branch**: `002-auth-production-verification`  
**Created**: 2026-08-01  
**Status**: Approved (Enterprise Production Standard)  
**Input**: User description: "Update Specification 002 to enterprise production standards. Supabase Auth as sole authentication provider, auth_user as application profile table linked via immutable Supabase User ID (UUID), backend token verification + RBAC permission checks, RLS policies, audit logging, Zod validation, and zero custom JWT or password storage in business tables."

---

## Executive Summary & Enterprise Architecture

### Executive Summary
The **Bosch Sales CRM** application requires a hardened, enterprise-grade authentication and authorization architecture. This specification updates Feature 002 to enforce complete separation between **Authentication** (handled exclusively by Supabase Auth) and **Authorization / Application Profiles** (managed via the `auth_user` profile table and Role-Based Access Control).

### Enterprise Security Architecture

```
 ┌────────────────────────────────┐      ┌────────────────────────────────┐      ┌────────────────────────────────┐
 │ Supabase Auth (auth.users)     │      │ Application Profile (auth_user)│      │ Express API Gateway & RBAC     │
 ├────────────────────────────────┤      ├────────────────────────────────┤      ├────────────────────────────────┤
 │ • Primary Identity Provider    │ ---> │ • Linked via Supabase UUID     │ ---> │ • Central Token Verification   │
 │ • Password Salting & Hashing   │      │ • Roles (Super Admin, Admin,   │      │ • Zod Schema Request Validation│
 │ • Access & Refresh Tokens      │      │   Sales Manager, Exec, Viewer) │      │ • RBAC Permission Check        │
 │ • Email & Password Reset       │      │ • Permissions (e.g. can_delete)│      │ • Structured Audit Logging     │
 │ • Zero Passwords in App Tables │      │ • Zero Passwords Stored        │      │ • Row Level Security (RLS)     │
 └────────────────────────────────┘      └────────────────────────────────┘      └────────────────────────────────┘
```

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Database Credential Verification & Token Issuance (Priority: P1)

Users (Sales Executives, Pre-sales Engineers, Administrators) log into the Bosch Sales CRM using their registered credentials, requiring Supabase Auth to validate credentials and issue signed access tokens without custom backend password checks.

**Why this priority**: Essential security gateway for the entire application; delegates authentication entirely to Supabase Auth.

**Independent Test**: Can be tested by submitting valid Supabase credentials, verifying token issuance, and confirming that invalid passwords return structured HTTP 401 errors.

**Acceptance Scenarios**:
1. **Given** a user on the Login page with valid Supabase Auth credentials, **When** they submit the login form, **Then** Supabase Auth validates credentials and returns a Supabase-issued access token.
2. **Given** a user attempting to log in with incorrect credentials or unverified email, **When** they submit the form, **Then** access is denied with a generic, secure error message and no session token is issued.
3. **Given** an authentication attempt, **When** the request is processed, **Then** no fallback mock users, custom JWT signing, or local password checks occur.

---

### User Story 2 - Protected Route Access & Frontend Session Persistence (Priority: P1)

Authenticated users navigate across protected areas of the application (Dashboard, Customers, Products, Sales Pipeline) without losing session state, benefiting from automatic session restoration and token refresh.

**Why this priority**: Ensures seamless user navigation while preventing unauthorized access to protected application screens.

**Independent Test**: Can be tested by logging in, refreshing the browser or opening a direct link to a protected route, and confirming the Supabase session restores automatically.

**Acceptance Scenarios**:
1. **Given** an unauthenticated visitor navigating directly to a protected page (e.g., `/dashboard` or `/customers`), **When** the page loads, **Then** the route guard intercepts the request and redirects to the Login page.
2. **Given** an authenticated user with an active session, **When** they refresh the browser or open a new tab, **Then** native Supabase session restoration maintains login state.

---

### User Story 3 - Role-Based API Authorization & Middleware Protection (Priority: P1)

Users with different access privileges (Super Admin, Admin, Sales Manager, Sales Executive, Viewer) execute API operations according to their assigned roles and permissions.

**Why this priority**: Enforces Role-Based Access Control (RBAC) and prevents privilege escalation across administrative user management and sensitive pricing controls.

**Independent Test**: Can be tested by attempting to invoke administrative API endpoints using a standard Sales Executive token and confirming that access is strictly forbidden with HTTP 403.

**Acceptance Scenarios**:
1. **Given** a user logged in with Sales Executive role, **When** they attempt to execute administrative user management or delete catalog items (`can_delete_product`), **Then** the request is rejected with an HTTP 403 Forbidden response.
2. **Given** an authenticated Super Admin, **When** they access administrative user management, **Then** access is granted and full account controls are displayed.

---

### User Story 4 - Audit & Removal of Hardcoded Auth Artifacts (Priority: P2)

Developers and security auditors review the codebase to ensure zero hardcoded tokens, demo credentials, custom JWT signing routines, or mock authentication bypasses exist anywhere in the application.

**Why this priority**: Eliminates security vulnerabilities caused by leftover development mocks, legacy Django PBKDF2 hashing, or custom JWT signing.

**Independent Test**: Can be tested by inspecting all authentication paths and API client services to confirm 100% of authentication operations use Supabase Auth and Supabase access tokens.

**Acceptance Scenarios**:
1. **Given** the frontend and backend codebases, **When** audited for static user objects or custom JWT functions, **Then** zero hardcoded fallbacks or custom JWT generation routines exist.
2. **Given** a network interruption between frontend and backend, **When** a user attempts login, **Then** the system presents a network connection error rather than falling back to mock data.

---

### User Story 5 - Session Destruction & Secure Logout (Priority: P2)

Users log out of the application to terminate their active Supabase session, clearing stored tokens from the client browser and invalidating sessions across open tabs.

**Why this priority**: Protects account security upon user departure or shared device access.

**Independent Test**: Can be tested by clicking Logout, confirming Supabase session termination, and verifying that clicking the browser Back button does not reveal protected content.

**Acceptance Scenarios**:
1. **Given** an authenticated user on any page, **When** they click the Logout button, **Then** Supabase session is signed out, client token storage is cleared, and the user is redirected to the Login page.
2. **Given** a user who recently logged out, **When** they attempt to reuse previous tokens or navigate backwards in browser history, **Then** protected routes reject access and prompt for fresh login.

---

### Edge Cases

- **Expired Access Token**: When a user's access token expires, Supabase Auth automatically attempts token refresh; if refresh fails, the client redirects to `/login` with an expired session message.
- **Account Deactivation / Role Revocation**: If an administrator deactivates an account or revokes roles in `auth_user`, the user's next API request is rejected with HTTP 403 Forbidden.
- **Missing or Unlinked Profile**: If a valid Supabase Auth user lacks a corresponding `auth_user` profile record, the backend denies data access (HTTP 403 Profile Not Found) and logs an audit alert.
- **Database Row Level Security (RLS) Violation**: If a request bypasses API validation, Supabase PostgreSQL RLS policies reject unauthorized SQL execution.

---

## Requirements *(mandatory)*

### Functional Requirements

#### Authentication Architecture (Supabase Auth Sole Provider)
- **FR-001**: System MUST use Supabase Authentication as the sole authentication provider for User Registration, Login, Password Verification, Password Reset, Email Verification, and Session Management.
- **FR-002**: System MUST NOT authenticate credentials against password strings in application tables.
- **FR-003**: System MUST NOT generate custom JWT tokens (`jsonwebtoken` signing); all requests MUST use Supabase-issued access tokens.

#### Application Profile Architecture (`auth_user`)
- **FR-004**: The `auth_user` table MUST serve exclusively as an application profile table storing business metadata (`supabase_uid`, `employee_name`, `username`, `email`, `department`, `designation`, `employee_id`, `branch`, `role`, `permissions`, `is_staff`, `is_superuser`, `profile_status`, `created_at`, `updated_at`).
- **FR-005**: Passwords MUST NEVER be stored, hashed, or referenced inside `auth_user`.
- **FR-006**: The `auth_user` profile table MUST link to `auth.users` using the immutable `supabase_uid` (UUID) as the primary relationship key, never email.

#### Backend Authentication & RBAC Middleware
- **FR-007**: Backend API MUST validate Supabase access tokens (`supabase.auth.getUser(token)`) on all protected routes.
- **FR-008**: Backend API MUST load the matching `auth_user` profile by `supabase_uid` and attach user roles and permissions to the request object.
- **FR-009**: System MUST return HTTP 401 for missing, invalid, or expired tokens, and HTTP 403 when a user lacks required role/permission flags.
- **FR-010**: System MUST enforce Role-Based Access Control (RBAC) supporting roles (`Super Admin`, `Admin`, `Sales Manager`, `Sales Executive`, `Viewer`) and explicit permissions (`can_create_product`, `can_update_product`, `can_delete_product`, `can_view_reports`, `can_manage_users`, `can_export_reports`).

#### Database Security (RLS Policies)
- **FR-011**: Database tables (`auth_user`, `exapp_totalsolutions`, `exapp_boq`, `customers`, `sales_opportunities`) MUST enforce Row Level Security (RLS) policies for `SELECT`, `INSERT`, `UPDATE`, and `DELETE`.
- **FR-012**: Supabase Service Role Key MUST be reserved strictly for trusted backend administrative operations and MUST NEVER be exposed to the client.

#### API Security, Error Handling & Audit Logging
- **FR-013**: Backend API MUST validate incoming request payloads using Zod schema validation.
- **FR-014**: System MUST log security events (`login`, `logout`, `password_reset`, `profile_update`, `role_change`, `failed_auth`, `admin_action`) in an `auth_audit_logs` table.
- **FR-015**: API responses MUST NOT expose sensitive stack traces or internal implementation details.

---

### Key Entities

- **Supabase Auth User (`auth.users`)**: Native identity record (UUID `id`, `email`, `created_at`, `confirmed_at`).
- **Application Profile (`auth_user`)**: Business profile table linked via `supabase_uid` UUID (`id`, `supabase_uid`, `employee_name`, `username`, `email`, `department`, `designation`, `employee_id`, `branch`, `role`, `permissions`, `is_staff`, `is_superuser`, `profile_status`, `created_at`, `updated_at`).
- **Audit Log (`auth_audit_logs`)**: Security event log (`id`, `user_id`, `event_type`, `ip_address`, `user_agent`, `details`, `created_at`).

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of authentication operations run through native Supabase Auth services; 0% custom JWT generation or local password checks exist.
- **SC-002**: 100% of protected API routes validate Supabase access tokens and load profile roles by `supabase_uid` in under 150 milliseconds.
- **SC-003**: 0 password fields or legacy password verification functions (`pbkdf2_sha256`, custom bcrypt comparators) exist in application code or tables.
- **SC-004**: 100% of unauthorized or insufficient-permission requests return proper HTTP 401 Unauthorized or HTTP 403 Forbidden status codes.
- **SC-005**: 100% of security events (`login`, `logout`, `role_change`, `failed_auth`) are written to `auth_audit_logs`.

---

## Assumptions & Constraints

### Assumptions
- A Supabase project is provisioned with Supabase Auth enabled and PostgreSQL database RLS active.
- Client applications access APIs via standard `Authorization: Bearer <supabase_access_token>` HTTP headers.

### Constraints
- Do not alter existing UI layout, pages, or business CRM modules.
- Maintain full separation between authentication (Supabase Auth) and authorization (`auth_user` RBAC).
