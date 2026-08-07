# Data Model, RBAC & Security Schemas: Authentication Verification

**Feature**: [spec.md](file:///D:/newUser/Pre-sales-CRM/bosch_sales_dashboard/specs/002-auth-production-verification/spec.md) | **Plan**: [plan.md](file:///D:/newUser/Pre-sales-CRM/bosch_sales_dashboard/specs/002-auth-production-verification/plan.md)  
**Date**: 2026-08-01  

---

## 1. Relational Entity Overview

```
 [ Supabase Auth (auth.users) ]
   - id: UUID (Primary Key)
   - email: String
   - created_at: Timestamp
              |
              | 1-to-1 Link (Foreign Key: supabase_uid)
              v
 [ Application Profile (auth_user) ]
   - id: BigInt / Serial (Primary Key)
   - supabase_uid: UUID (Foreign Key -> auth.users.id, UNIQUE, NOT NULL)
   - employee_name: String (255)
   - username: String (150, UNIQUE)
   - email: String (254, NOT NULL)
   - department: String (100)
   - designation: String (100)
   - employee_id: String (50, UNIQUE)
   - branch: String (100)
   - role: String (50) -- 'Super Admin', 'Admin', 'Sales Manager', 'Sales Executive', 'Viewer'
   - permissions: JSONB / Array -- ['can_create_product', 'can_delete_product', ...]
   - is_staff: SmallInt (0 or 1)
   - is_superuser: SmallInt (0 or 1)
   - profile_status: String (50) -- 'ACTIVE', 'SUSPENDED', 'PENDING'
   - created_at: Timestamp TZ
   - updated_at: Timestamp TZ
              |
              v
 [ Security Audit Logs (auth_audit_logs) ]
   - id: BigInt / BigSerial (Primary Key)
   - user_id: UUID / String
   - event_type: String (100) -- 'LOGIN_SUCCESS', 'LOGIN_FAILED', 'ROLE_CHANGED', ...
   - ip_address: String (45)
   - user_agent: Text
   - details: JSONB
   - created_at: Timestamp TZ
```

---

## 2. Table Specifications

### 2.1 Application Profile (`auth_user`)

> **CRITICAL SECURITY REQUIREMENT**: Passwords MUST NEVER exist inside `auth_user`. Password fields are removed.

| Field Name | Type | Constraints | Description |
|------------|------|-------------|-------------|
| `id` | Serial | Primary Key | Profile record ID |
| `supabase_uid` | UUID | Foreign Key (`auth.users.id`), Unique, Not Null | Immutable link to Supabase Auth |
| `employee_name` | String (255) | Not Null | Full employee name |
| `username` | String (150) | Unique, Not Null | Unique username handle |
| `email` | String (254) | Not Null | User email address |
| `department` | String (100) | Nullable | Business department (e.g., Pre-sales, Engineering) |
| `designation` | String (100) | Nullable | Job title |
| `employee_id` | String (50) | Unique, Nullable | Corporate employee code |
| `branch` | String (100) | Nullable | Regional branch office |
| `role` | String (50) | Not Null | Role designation (`Super Admin`, `Admin`, `Sales Manager`, `Sales Executive`, `Viewer`) |
| `permissions` | JSONB | Default: `[]` | Array of explicit permission strings |
| `is_staff` | SmallInt | Default: 0 | 1 = Staff access, 0 = Non-staff |
| `is_superuser` | SmallInt | Default: 0 | 1 = Superuser admin, 0 = Standard |
| `profile_status` | String (50) | Default: `'ACTIVE'` | Account status (`ACTIVE`, `SUSPENDED`, `PENDING`) |
| `created_at` | Timestamp TZ | Default: `NOW()` | Profile creation timestamp |
| `updated_at` | Timestamp TZ | Default: `NOW()` | Profile last updated timestamp |

---

### 2.2 Security Audit Log (`auth_audit_logs`)

| Field Name | Type | Constraints | Description |
|------------|------|-------------|-------------|
| `id` | BigSerial | Primary Key | Audit log ID |
| `user_id` | String (255) | Nullable | Supabase UID or profile ID |
| `event_type` | String (100) | Not Null | Event code (`LOGIN_SUCCESS`, `LOGIN_FAILED`, `LOGOUT`, `ROLE_CHANGE`, `PROFILE_UPDATE`, `PERMISSION_CHANGE`) |
| `ip_address` | String (45) | Nullable | Client IP address |
| `user_agent` | Text | Nullable | Client browser user agent |
| `details` | JSONB | Nullable | Context payload (e.g., modified fields, error message) |
| `created_at` | Timestamp TZ | Default: `NOW()` | Log timestamp |

---

## 3. Database Row Level Security (RLS) Policies

### 3.1 `auth_user` RLS Policies
```sql
ALTER TABLE auth_user ENABLE ROW LEVEL SECURITY;

-- Users can read their own profile
CREATE POLICY "Users can read own profile" ON auth_user
  FOR SELECT USING (auth.uid() = supabase_uid);

-- Admins and Staff can read all profiles
CREATE POLICY "Admins can read all profiles" ON auth_user
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM auth_user WHERE supabase_uid = auth.uid() AND (is_superuser = 1 OR is_staff = 1)
    )
  );

-- Only Superusers can update profiles and roles
CREATE POLICY "Superusers can update profiles" ON auth_user
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM auth_user WHERE supabase_uid = auth.uid() AND is_superuser = 1
    )
  );
```

### 3.2 `exapp_totalsolutions` (Products Catalog) RLS Policies
```sql
ALTER TABLE exapp_totalsolutions ENABLE ROW LEVEL SECURITY;

-- Authenticated users can view products
CREATE POLICY "Authenticated users view products" ON exapp_totalsolutions
  FOR SELECT USING (auth.role() = 'authenticated');

-- Users with can_create_product permission can insert
CREATE POLICY "Staff insert products" ON exapp_totalsolutions
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth_user 
      WHERE supabase_uid = auth.uid() 
      AND (is_staff = 1 OR permissions @> '["can_create_product"]')
    )
  );

-- Users with can_delete_product permission can delete
CREATE POLICY "Staff delete products" ON exapp_totalsolutions
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM auth_user 
      WHERE supabase_uid = auth.uid() 
      AND (is_superuser = 1 OR permissions @> '["can_delete_product"]')
    )
  );
```

---

## 4. RBAC Permission Matrix

| Permission Key | Super Admin | Admin | Sales Manager | Sales Executive | Viewer |
|----------------|-------------|-------|---------------|-----------------|--------|
| `can_create_product` | ✓ | ✓ | ✓ | ✓ | ✗ |
| `can_update_product` | ✓ | ✓ | ✓ | ✓ | ✗ |
| `can_delete_product` | ✓ | ✓ | ✗ | ✗ | ✗ |
| `can_view_reports` | ✓ | ✓ | ✓ | ✓ | ✓ |
| `can_export_reports` | ✓ | ✓ | ✓ | ✗ | ✗ |
| `can_manage_users` | ✓ | ✓ | ✗ | ✗ | ✗ |
