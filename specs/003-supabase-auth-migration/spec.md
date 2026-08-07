# Feature Specification: Authentication Migration to Supabase Auth

**Feature Branch**: `003-supabase-auth-migration`  
**Created**: 2026-08-01  
**Status**: Draft  
**Input**: User description: "Authentication Migration to Supabase Auth. Replace manual auth_user authentication. Use Supabase Auth for login/logout. Link authenticated users to application roles and permissions. Remove hardcoded/demo authentication. Verify frontend <-> backend <-> database communication. Ensure JWT/session handling is production-ready."

---

## Executive Summary & Objectives

### Executive Summary
The **Bosch Sales CRM** application is transitioning its authentication infrastructure from manual, custom-table credential checks (`auth_user`) to **Supabase Auth**. This feature migrates user identity management, credential verification, and session token generation to Supabase Auth services while maintaining seamless linking between authenticated identities and application-level roles, permissions, and business data.

### Core Objectives
- **Native Supabase Authentication**: Replace manual database table lookups with Supabase Auth services for user login, registration, and session token generation.
- **Application Role & Permission Binding**: Link authenticated Supabase user identities to application role profiles (Staff, Superuser/Admin, Sales Representative) to preserve access governance.
- **Production-Ready Session Management**: Ensure client-side session tokens, automatic token refresh, and backend bearer token verification operate securely without relying on legacy manual auth methods.
- **Complete Legacy Deprecation**: Remove manual `auth_user` password hashing functions (`pbkdf2_sha256`, manual bcrypt comparisons) and hardcoded fallback logic from frontend and backend modules.

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Supabase Native User Login & Token Issuance (Priority: P1)

Sales Engineers and Administrators log into the Bosch Sales Hub using Supabase Auth credentials, receiving a verified session token for application access.

**Why this priority**: Core identity entry point; migrating to Supabase Auth ensures industry-standard encryption, token refresh, and identity management.

**Independent Test**: Can be tested by submitting valid Supabase credentials on the Login screen, receiving an authenticated session token, and confirming that invalid credentials return structured authentication errors.

**Acceptance Scenarios**:
1. **Given** a user on the Login screen, **When** they submit valid Supabase Auth credentials, **Then** Supabase validates the identity, returns a session token, and grants access to the dashboard.
2. **Given** a user entering incorrect credentials, **When** they attempt to log in, **Then** Supabase Auth rejects the attempt with an unauthorized error message and no session token is stored.
3. **Given** an authentication request, **When** processed by the system, **Then** credential verification bypasses manual table queries and relies entirely on Supabase Auth.

---

### User Story 2 - User Role & Permission Mapping (Priority: P1)

Authenticated users have their Supabase identity linked to their application profile, ensuring access to features is governed by their assigned role (Standard User, Staff, Superuser).

**Why this priority**: Essential for maintaining access control so non-admin users cannot access administrative user management or sensitive pricing controls.

**Independent Test**: Can be tested by logging in as a standard sales representative, verifying access to sales/quotations, and confirming that administrative routes are restricted based on profile role mappings.

**Acceptance Scenarios**:
1. **Given** an authenticated Supabase user, **When** their application profile is loaded, **Then** their assigned role (e.g., Staff or Superuser) determines authorized routes and API capabilities.
2. **Given** a new Supabase user without an assigned administrative role, **When** they access the system, **Then** they receive standard default user permissions.

---

### User Story 3 - Backend API Token Verification via Supabase (Priority: P1)

The backend REST API validates incoming bearer tokens using Supabase Auth verification services before fulfilling data requests for products, customers, quotations, and reports.

**Why this priority**: Protects all backend endpoints against unauthorized access, token tampering, or expired session reuse.

**Independent Test**: Can be tested by making API requests with valid Supabase tokens (succeeds) versus missing or tampered tokens (fails with 401 Unauthorized).

**Acceptance Scenarios**:
1. **Given** an API request with a valid Supabase bearer token in the headers, **When** the backend middleware verifies the token, **Then** the request is authorized and processed.
2. **Given** an API request with an expired or invalid token, **When** backend middleware checks authorization, **Then** the request is rejected immediately with a 401 Unauthorized status.

---

### User Story 4 - Deprecation of Legacy Manual `auth_user` Logic (Priority: P2)

Developers and maintainers verify that custom password hashing routines, manual table lookups, and hardcoded authentication fallbacks are completely removed from the codebase.

**Why this priority**: Eliminates technical debt, security risks, and confusion between old manual table authentication and new Supabase Auth.

**Independent Test**: Can be tested by searching the codebase for manual password hashing functions or fallback user objects and confirming 100% removal.

**Acceptance Scenarios**:
1. **Given** the backend authentication module, **When** inspected by security tools, **Then** no manual password hash comparison routines (`pbkdf2` or custom bcrypt) remain.
2. **Given** the frontend authentication context, **When** inspected, **Then** zero hardcoded demo users or fallback credentials exist.

---

### User Story 5 - Supabase Session Management & Secure Logout (Priority: P2)

Users log out of the application, triggering Supabase Auth session termination and clearing stored tokens from the client browser.

**Why this priority**: Guarantees complete session destruction upon user exit, preventing unauthorized access on shared devices.

**Independent Test**: Can be tested by clicking Logout, verifying Supabase session termination, and confirming that browser Back navigation forces re-authentication.

**Acceptance Scenarios**:
1. **Given** an active user session, **When** the user clicks Logout, **Then** Supabase Auth invalidates the session, clears local storage tokens, and redirects to the Login screen.
2. **Given** a logged-out user, **When** they attempt to access protected pages, **Then** route guards redirect them to the Login page.

---

### Edge Cases

- **Supabase Auth Outage / Network Timeout**: If the client cannot connect to Supabase Auth services, a clear network error is presented rather than crashing the interface.
- **Unlinked User Profile**: If a valid Supabase Auth user has no associated application profile record, the system assigns a safe default role (Standard) and notifies administrators.
- **Expired Token Auto-Refresh**: When a token expires during active user operation, Supabase client automatically attempts session refresh before prompting for re-login.

---

## Requirements *(mandatory)*

### Functional Requirements

#### Supabase Auth Integration
- **FR-001**: System MUST authenticate user credentials using native Supabase Auth services.
- **FR-002**: System MUST issue and manage authenticated session tokens via Supabase Auth client SDKs.
- **FR-003**: System MUST support user login, logout, and automatic session restoration using Supabase Auth.

#### Profile & Role Binding
- **FR-004**: System MUST link each authenticated Supabase user ID to an application profile table storing user roles (`is_staff`, `is_superuser`).
- **FR-005**: System MUST enforce role-based access control based on the linked application profile.

#### API Verification & Security
- **FR-006**: Backend API MUST verify incoming Supabase bearer tokens on all protected routes using Supabase verification middleware.
- **FR-007**: System MUST reject requests with invalid, missing, or expired tokens with HTTP 401 Unauthorized responses.
- **FR-008**: System MUST reject unauthorized role requests with HTTP 403 Forbidden responses.

#### Legacy Code Cleanup & Removal
- **FR-009**: Codebase MUST NOT contain manual password hashing algorithms (`pbkdf2_sha256` or custom bcrypt verifiers) for login authentication.
- **FR-010**: Codebase MUST NOT contain hardcoded user objects, static bypass tokens, or demo login accounts.

#### Session Lifecycle & Logout
- **FR-011**: Client application MUST store active Supabase session tokens securely in browser storage.
- **FR-012**: Client application MUST clear session tokens and terminate Supabase sessions upon user logout.
- **FR-013**: Client application MUST automatically redirect visitors to the Login page when session validation fails.

---

### Key Entities

- **Supabase Auth User**: Core identity object managed by Supabase Auth (contains UID, email, created timestamp, metadata).
- **Application User Profile**: Application-level profile table linked to Supabase UID (contains first name, last name, `is_staff` flag, `is_superuser` flag, assigned team).
- **Role Permission Scopes**: Access control matrix mapping profiles to permitted API actions and UI views.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of user authentication requests process through native Supabase Auth services; 0% pass through legacy manual table checks.
- **SC-002**: 100% of protected backend API endpoints validate incoming Supabase tokens, returning HTTP 401/403 for unauthorized requests.
- **SC-003**: 0 manual password verification functions (`pbkdf2_sha256`, custom bcrypt comparators) or hardcoded credentials remain in the codebase.
- **SC-004**: Login authentication and token issuance complete in under 300 milliseconds on standard network connections.
- **SC-005**: 100% of logout events trigger total session destruction and client storage token removal.

---

## Assumptions & Constraints

### Assumptions
- A Supabase project is provisioned with Supabase Auth enabled.
- The application environment contains valid `SUPABASE_URL` and `SUPABASE_KEY` configuration variables.

### Constraints
- Preserve existing application layout, styling, pages (Dashboard, Customers, Products, Sales, Reports), and business logic modules.
- Ensure smooth transition for existing user profiles linked to Supabase UIDs.
