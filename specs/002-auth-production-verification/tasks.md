# Tasks: Enterprise Authentication & Authorization Architecture

**Feature**: [spec.md](file:///D:/newUser/Pre-sales-CRM/bosch_sales_dashboard/specs/002-auth-production-verification/spec.md) | **Plan**: [plan.md](file:///D:/newUser/Pre-sales-CRM/bosch_sales_dashboard/specs/002-auth-production-verification/plan.md)  
**Date**: 2026-08-01  

---

## Task Overview & Dependency Tree

```
  [Phase 1: Database & RLS]
      │
      ├─► Task 1.1: Add supabase_uid UUID Foreign Key & Remove Password Columns from auth_user
      ├─► Task 1.2: Create auth_audit_logs Table
      └─► Task 1.3: Apply RLS Policies across PostgreSQL Tables (auth_user, products, boq)
      │
  [Phase 2: Express Backend & RBAC Middleware]
      │
      ├─► Task 2.1: Implement Pure Supabase Access Token Validation Middleware
      ├─► Task 2.2: Implement RBAC Permission Verification Middleware
      ├─► Task 2.3: Implement Zod Schema Validation Middleware
      ├─► Task 2.4: Implement Audit Logging Service
      └─► Task 2.5: Remove Legacy Password/JWT Code from auth.js & products.js
      │
  [Phase 3: Frontend Native Supabase Session]
      │
      ├─► Task 3.1: Configure Native Supabase Session Provider & Token Refresh in App.jsx
      └─► Task 3.2: Update Route Guards with RBAC Role & Permission Checking
      │
  [Phase 4: Verification & Security Audit]
      └─► Task 4.1: Execute Enterprise Security & RLS Verification Suite
```

---

## Phase 1: Database & RLS Security

- [x] **Task 1.1**: Link `auth_user` to `auth.users` via immutable `supabase_uid` (UUID) foreign key and purge password columns from `auth_user`.
  - **Files**: `supabase_schema.sql`
  - **Verification**: `SELECT supabase_uid FROM auth_user LIMIT 1;` returns valid UUID format linked to `auth.users`.

- [x] **Task 1.2**: Create `auth_audit_logs` table for tracking security events (`LOGIN_SUCCESS`, `LOGIN_FAILED`, `LOGOUT`, `ROLE_CHANGE`, `PERMISSION_CHANGE`).
  - **Files**: `supabase_schema.sql`
  - **Verification**: Query table schema in Supabase SQL editor.

- [x] **Task 1.3**: Apply Row Level Security (RLS) policies across `auth_user`, `exapp_totalsolutions`, and `exapp_boq` tables for `SELECT`, `INSERT`, `UPDATE`, and `DELETE`.
  - **Files**: `supabase_schema.sql`
  - **Verification**: Verify RLS policies are active on PostgreSQL tables.

---

## Phase 2: Express Backend & RBAC Middleware

- [x] **Task 2.1**: Refactor `verifyToken` middleware to validate Supabase access tokens via `@supabase/supabase-js` (`supabase.auth.getUser(token)`).
  - **Files**: [`backend/routes/auth.js`](file:///D:/newUser/Pre-sales-CRM/bosch_sales_dashboard/backend/routes/auth.js)
  - **Verification**: Protected endpoints accept Supabase access tokens and reject invalid tokens with HTTP 401.

- [x] **Task 2.2**: Implement RBAC permission middleware (`checkPermission('can_create_product')`, `checkRole('Admin')`) loading user profile from `auth_user` by `supabase_uid`.
  - **Files**: `backend/middleware/rbac.js`, [`backend/routes/products.js`](file:///D:/newUser/Pre-sales-CRM/bosch_sales_dashboard/backend/routes/products.js)
  - **Verification**: Non-permitted roles receive HTTP 403 Forbidden.

- [x] **Task 2.3**: Implement Zod request payload validation schemas (`LoginSchema`, `UpdateProfileSchema`) and error handler.
  - **Files**: `backend/middleware/validateZod.js`
  - **Verification**: Invalid email/password formats return HTTP 400 Bad Request with field errors.

- [x] **Task 2.4**: Create audit logging service to record security events in `auth_audit_logs`.
  - **Files**: `backend/services/auditService.js`
  - **Verification**: Login/logout actions write records to `auth_audit_logs`.

- [x] **Task 2.5**: Audit and purge all legacy password hashing routines (`pbkdf2_sha256`, manual bcrypt comparators) and custom JWT signing routines from backend routes.
  - **Files**: [`backend/routes/auth.js`](file:///D:/newUser/Pre-sales-CRM/bosch_sales_dashboard/backend/routes/auth.js), [`backend/routes/products.js`](file:///D:/newUser/Pre-sales-CRM/bosch_sales_dashboard/backend/routes/products.js)
  - **Verification**: `grep -rn "jwt.sign" backend/` returns 0 matches.

---

## Phase 3: Frontend Native Supabase Session Management

- [x] **Task 3.1**: Configure native Supabase session listener (`supabase.auth.onAuthStateChange`), token refresh, and multi-tab sync in `App.jsx`.
  - **Files**: [`frontend/src/App.jsx`](file:///D:/newUser/Pre-sales-CRM/bosch_sales_dashboard/frontend/src/App.jsx)
  - **Verification**: Page refresh and multi-tab navigation preserve active Supabase session.

- [x] **Task 3.2**: Update frontend route guards to check user RBAC roles and permissions.
  - **Files**: [`frontend/src/App.jsx`](file:///D:/newUser/Pre-sales-CRM/bosch_sales_dashboard/frontend/src/App.jsx)
  - **Verification**: Users without required permissions are blocked from administrative screens.

---

## Phase 4: Enterprise Security Review & Testing

- [x] **Task 4.1**: Execute enterprise security verification suite (token validation, RBAC 403 checks, RLS enforcement, audit log logging).
  - **Files**: `specs/002-auth-production-verification/quickstart.md`
  - **Verification**: 100% of security checks pass with zero legacy code or custom JWT dependencies.
