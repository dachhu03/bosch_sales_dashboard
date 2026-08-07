# Architectural Research & Enterprise Security Analysis: Authentication Verification

**Feature**: [spec.md](file:///D:/newUser/Pre-sales-CRM/bosch_sales_dashboard/specs/002-auth-production-verification/spec.md) | **Plan**: [plan.md](file:///D:/newUser/Pre-sales-CRM/bosch_sales_dashboard/specs/002-auth-production-verification/plan.md)  
**Date**: 2026-08-01  

---

## 1. Single Authentication Provider Strategy (Supabase Auth)

### Decision
Utilize **Supabase Authentication** as the exclusive identity provider across the application. Supabase Auth handles user registration, login, password salting/hashing, email verification, password resets, session management, access tokens, and refresh tokens.

### Rationale
- **Zero Local Passwords**: Eliminates password storage and hashing routines (`bcrypt`, `pbkdf2_sha256`) from application code and database tables.
- **Zero Custom JWT Signing**: Uses native Supabase-issued access tokens verified via `@supabase/supabase-js` (`supabase.auth.getUser(token)`).
- **Hardened Identity Lifecycle**: Built-in multi-tab session synchronization, automatic token refresh, and cryptographically verified claims.

### Alternatives Considered
- *Custom JWT + Local Password Hashing*: Rejected due to maintenance overhead, security vulnerability risks, and duplicate identity stores.
- *Hybrid Auth*: Rejected per enterprise standards; pure Supabase Auth provides a single, audited entry point.

---

## 2. Immutable Profile Linking Architecture (`auth_user`)

### Decision
Refactor `auth_user` into a pure business profile table. Link `auth_user` to `auth.users` via immutable `supabase_uid` (UUID) foreign key.

```sql
ALTER TABLE auth_user ADD COLUMN IF NOT EXISTS supabase_uid UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE;
```

### Rationale
- **Immutable Identifier**: Email addresses change; UUID `supabase_uid` remains permanently fixed to the identity record.
- **Strict Separation of Concerns**: Authentication state belongs to Supabase Auth; business metadata (department, designation, employee ID, branch, roles) belongs to `auth_user`.

### Alternatives Considered
- *Email-based Foreign Key*: Rejected because user email updates break relational integrity.
- *Storing Business Roles in Supabase App Metadata*: Rejected to allow rich relational querying across pre-sales teams, branches, and reporting hierarchies.

---

## 3. Role-Based Access Control (RBAC) & Permissions Matrix

### Decision
Implement an explicit RBAC authorization layer stored in `auth_user`. Support 5 hierarchical roles and granular permission flags:

| Role | `is_superuser` | `is_staff` | Default Permissions |
|------|----------------|------------|---------------------|
| **Super Admin** | 1 | 1 | `can_create_product`, `can_update_product`, `can_delete_product`, `can_view_reports`, `can_manage_users`, `can_export_reports` |
| **Admin** | 0 | 1 | `can_create_product`, `can_update_product`, `can_delete_product`, `can_view_reports`, `can_manage_users`, `can_export_reports` |
| **Sales Manager** | 0 | 1 | `can_create_product`, `can_update_product`, `can_view_reports`, `can_export_reports` |
| **Sales Executive** | 0 | 1 | `can_create_product`, `can_update_product`, `can_view_reports` |
| **Viewer** | 0 | 0 | `can_view_reports` |

---

## 4. PostgreSQL Row Level Security (RLS) Policies

### Decision
Enable RLS on all database tables (`auth_user`, `exapp_totalsolutions`, `exapp_boq`, `customers`, `sales_opportunities`) and define policies for `SELECT`, `INSERT`, `UPDATE`, and `DELETE`.

### Rationale
- **Defense in Depth**: Even if an API route fails to check a role, database-level RLS policies prevent unauthorized SQL reads or mutations.
- **Service Role Isolation**: Service Role Key is kept confidential on the backend server for trusted admin operations.

---

## 5. Request Payload Validation & Audit Logging

### Decision
1. **Zod Validation**: Validate all incoming API request headers, body parameters, and query strings against strict Zod schemas before processing.
2. **Audit Logging**: Record all security-sensitive events (`login`, `logout`, `password_reset`, `profile_update`, `role_change`, `failed_auth`, `admin_action`) in an `auth_audit_logs` table with timestamp, user ID, event type, IP address, and details.
