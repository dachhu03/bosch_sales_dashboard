# Data Model & Security Schema: Supabase Auth Migration

**Feature**: [spec.md](file:///D:/newUser/Pre-sales-CRM/bosch_sales_dashboard/specs/003-supabase-auth-migration/spec.md) | **Plan**: [plan.md](file:///D:/newUser/Pre-sales-CRM/bosch_sales_dashboard/specs/003-supabase-auth-migration/plan.md)  
**Date**: 2026-08-01  

---

## 1. Identity & Profile Entity Relationship

```
 [ Supabase Auth (auth.users) ]
   - id: UUID (Primary Key)
   - email: String
   - created_at: Timestamp
              |
              v (Linked via email or username)
 [ Application Profile (auth_user) ]
   - id: Serial (Primary Key)
   - username: String
   - email: String
   - is_staff: SmallInt (0 or 1)
   - is_superuser: SmallInt (0 or 1)
   - is_active: SmallInt (0 or 1)
```

---

## 2. Entity Specifications

### 2.1 `SupabaseUser` (`auth.users`)
Managed natively by Supabase Auth service.

| Field Name | Type | Description |
|------------|------|-------------|
| `id` | UUID | Unique Supabase identity identifier |
| `email` | String | User email address |
| `aud` | String | Audience claim (`authenticated`) |
| `role` | String | Supabase role claim (`authenticated`) |
| `created_at` | Timestamp | Account creation timestamp |

### 2.2 `ApplicationUserProfile` (`auth_user`)
Application-level profile table storing user authorization roles.

| Field Name | Type | Constraints | Description |
|------------|------|-------------|-------------|
| `id` | Serial | Primary Key | Profile record ID |
| `username` | String (150) | Unique, Not Null | Application username |
| `email` | String (254) | Nullable | Linked email matching Supabase Auth |
| `is_staff` | SmallInt | Default: 0 | Staff access flag |
| `is_superuser` | SmallInt | Default: 0 | Administrator access flag |
| `is_active` | SmallInt | Default: 1 | Active status flag |

---

## 3. Session State Lifecycle

```
[ Unauthenticated ] ---> Submit Email/Password ---> ( supabase.auth.signInWithPassword )
                                                                 |
                                               +-----------------+-----------------+
                                               | (Error)                           | (Success)
                                               v                                   v
                                    [ Display Auth Error ]              [ Supabase Session Issued ]
                                                                                   |
                                                                                   v
                                                                       ( Fetch Profile & Roles )
                                                                                   |
                                                                                   v
                                                                       [ Active App Session ]
                                                                                   |
                                                           +-----------------------+-----------------------+
                                                           | (Logout Clicked)                              | (Token Expired)
                                                           v                                               v
                                               ( supabase.auth.signOut )                       ( supabase.auth.refreshSession )
                                                           |                                               |
                                                           v                                               v
                                                [ Clear Session State ]                         [ Session Restored / Re-login ]
```
