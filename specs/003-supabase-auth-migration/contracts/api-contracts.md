# REST API Interface Contracts: Supabase Auth Migration

**Feature**: [spec.md](file:///D:/newUser/Pre-sales-CRM/bosch_sales_dashboard/specs/003-supabase-auth-migration/spec.md) | **Plan**: [plan.md](file:///D:/newUser/Pre-sales-CRM/bosch_sales_dashboard/specs/003-supabase-auth-migration/plan.md)  
**Date**: 2026-08-01  

All endpoints require `Content-Type: application/json`. Protected endpoints require `Authorization: Bearer <supabase_access_token>`.

---

## 1. `POST /api/auth/login`

Authenticates credentials via Supabase Auth client, fetches linked application profile roles, and sets session token.

- **Auth**: Public
- **Request Body**:
  ```json
  {
    "email": "user@bosch.com",
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
      "id": 1,
      "username": "user_bosch",
      "email": "user@bosch.com",
      "is_staff": 1,
      "is_superuser": 0
    }
  }
  ```
- **Response `401 Unauthorized`**:
  ```json
  {
    "status": "error",
    "message": "Invalid email or password."
  }
  ```

---

## 2. `GET /api/auth/validate`

Validates Supabase Bearer access token and returns associated user profile.

- **Auth**: Bearer Token required (`Authorization: Bearer <token>`)
- **Response `200 OK`**:
  ```json
  {
    "status": "success",
    "user": {
      "id": 1,
      "username": "user_bosch",
      "email": "user@bosch.com",
      "is_staff": 1,
      "is_superuser": 0
    }
  }
  ```
- **Response `401 Unauthorized`**:
  ```json
  {
    "status": "error",
    "message": "Invalid or expired token."
  }
  ```

---

## 3. `POST /api/auth/logout`

Terminates active Supabase session.

- **Auth**: Bearer Token required
- **Response `200 OK`**:
  ```json
  {
    "status": "success",
    "message": "Logged out successfully."
  }
  ```
