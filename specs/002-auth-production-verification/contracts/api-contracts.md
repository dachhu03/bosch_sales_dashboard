# REST API & Zod Schema Contracts: Enterprise Authentication & Authorization

**Feature**: [spec.md](file:///D:/newUser/Pre-sales-CRM/bosch_sales_dashboard/specs/002-auth-production-verification/spec.md) | **Plan**: [plan.md](file:///D:/newUser/Pre-sales-CRM/bosch_sales_dashboard/specs/002-auth-production-verification/plan.md)  
**Date**: 2026-08-01  

All API endpoints expect `Content-Type: application/json`. All protected endpoints require `Authorization: Bearer <supabase_access_token>`.

---

## 1. Zod Validation Schemas

### 1.1 Login Request Schema
```javascript
import { z } from 'zod';

export const LoginSchema = z.object({
  email: z.string().email('Valid corporate email is required'),
  password: z.string().min(6, 'Password must be at least 6 characters')
});
```

### 1.2 User Profile Update Schema
```javascript
export const UpdateProfileSchema = z.object({
  employee_name: z.string().min(2).optional(),
  department: z.string().optional(),
  designation: z.string().optional(),
  branch: z.string().optional(),
  role: z.enum(['Super Admin', 'Admin', 'Sales Manager', 'Sales Executive', 'Viewer']).optional(),
  permissions: z.array(z.string()).optional()
});
```

---

## 2. API Endpoint Contracts

### 2.1 `POST /api/auth/login`

Authenticates credentials using native Supabase Auth, fetches linked `auth_user` profile by `supabase_uid`, and records a `LOGIN_SUCCESS` or `LOGIN_FAILED` audit log.

- **Auth**: Public
- **Request Body** (validated via `LoginSchema`):
  ```json
  {
    "email": "executive@bosch.com",
    "password": "SecurePassword123!"
  }
  ```
- **Response `200 OK`**:
  ```json
  {
    "status": "success",
    "message": "Login successful.",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 42,
      "supabase_uid": "dc8dd0b2-6fb6-459a-b6ad-fe3e3e099fa0",
      "employee_name": "Sales Executive",
      "username": "sales_exec",
      "email": "executive@bosch.com",
      "department": "Pre-sales",
      "designation": "Senior Sales Engineer",
      "role": "Sales Executive",
      "permissions": ["can_create_product", "can_update_product", "can_view_reports"],
      "is_staff": 1,
      "is_superuser": 0
    }
  }
  ```
- **Response `401 Unauthorized`**:
  ```json
  {
    "status": "error",
    "code": "INVALID_CREDENTIALS",
    "message": "Invalid email or password."
  }
  ```

---

### 2.2 `GET /api/auth/me` / `GET /api/auth/validate`

Validates the Supabase Bearer access token, retrieves the active user, and returns profile & permissions.

- **Auth**: Bearer Token required (`Authorization: Bearer <supabase_token>`)
- **Response `200 OK`**:
  ```json
  {
    "status": "success",
    "user": {
      "id": 42,
      "supabase_uid": "dc8dd0b2-6fb6-459a-b6ad-fe3e3e099fa0",
      "employee_name": "Sales Executive",
      "username": "sales_exec",
      "email": "executive@bosch.com",
      "department": "Pre-sales",
      "role": "Sales Executive",
      "permissions": ["can_create_product", "can_update_product", "can_view_reports"],
      "is_staff": 1,
      "is_superuser": 0
    }
  }
  ```
- **Response `401 Unauthorized`**:
  ```json
  {
    "status": "error",
    "code": "TOKEN_EXPIRED",
    "message": "Invalid or expired session token."
  }
  ```

---

### 2.3 `POST /api/auth/logout`

Terminates active Supabase Auth session and records a `LOGOUT` audit log.

- **Auth**: Bearer Token required
- **Response `200 OK`**:
  ```json
  {
    "status": "success",
    "message": "Logged out successfully."
  }
  ```

---

### 2.4 `PUT /api/auth/users/:id/role` (Admin Only)

Updates user profile role and explicit permissions in `auth_user`.

- **Auth**: Bearer Token required + `can_manage_users` permission (HTTP 403 if missing)
- **Request Body**:
  ```json
  {
    "role": "Sales Manager",
    "permissions": ["can_create_product", "can_update_product", "can_view_reports", "can_export_reports"]
  }
  ```
- **Response `200 OK`**:
  ```json
  {
    "status": "success",
    "message": "User role updated successfully."
  }
  ```
- **Response `403 Forbidden`**:
  ```json
  {
    "status": "error",
    "code": "PERMISSION_DENIED",
    "message": "Insufficient permissions to manage user roles."
  }
  ```
