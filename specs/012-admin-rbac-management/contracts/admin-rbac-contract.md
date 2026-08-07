# Interface Contract: Admin REST API & RBAC Authorization

**Feature**: Admin Management & Role-Based Access Control (RBAC)  
**Feature Directory**: `specs/012-admin-rbac-management`  

---

## 1. REST Endpoints (`/api/admin`)

### 1.1 List All Users
- **Endpoint**: `GET /api/admin/users`
- **Authorization**: Super Admin only (`requireRole('super_admin')`)
- **Success Response (200 OK)**:
```json
{
  "status": "success",
  "data": {
    "users": [
      {
        "id": 1,
        "username": "admin",
        "email": "admin@bosch.com",
        "role": "super_admin",
        "permissions": ["admin:full", "ratecard:read", "ratecard:write", "boq:read", "boq:write", "reports:read"],
        "is_active": 1,
        "is_staff": 1,
        "is_superuser": 1,
        "date_joined": "2026-01-15T10:00:00Z"
      },
      {
        "id": 2,
        "username": "sales_viewer",
        "email": "viewer@bosch.com",
        "role": "viewer",
        "permissions": ["ratecard:read", "boq:read", "reports:read"],
        "is_active": 1,
        "is_staff": 0,
        "is_superuser": 0,
        "date_joined": "2026-02-01T14:30:00Z"
      }
    ]
  }
}
```

---

### 1.2 Create User
- **Endpoint**: `POST /api/admin/users`
- **Authorization**: Super Admin only (`requireRole('super_admin')`)
- **Request Body**:
```json
{
  "username": "john_doe",
  "email": "john.doe@bosch.com",
  "password": "SecurePassword123!",
  "role": "presales_admin",
  "permissions": ["ratecard:read", "ratecard:write", "boq:read", "boq:write", "reports:read"]
}
```
- **Success Response (201 Created)**:
```json
{
  "status": "success",
  "message": "User created successfully.",
  "data": {
    "user": {
      "id": 12,
      "username": "john_doe",
      "email": "john.doe@bosch.com",
      "role": "presales_admin",
      "permissions": ["ratecard:read", "ratecard:write", "boq:read", "boq:write", "reports:read"],
      "is_active": 1
    }
  }
}
```

---

### 1.3 Update User Role & Permissions
- **Endpoint**: `PUT /api/admin/users/:id`
- **Authorization**: Super Admin only (`requireRole('super_admin')`)
- **Request Body**:
```json
{
  "role": "price_admin",
  "permissions": ["ratecard:read", "ratecard:price_write"],
  "username": "john_doe",
  "email": "john.doe@bosch.com"
}
```
- **Success Response (200 OK)**:
```json
{
  "status": "success",
  "message": "User updated successfully."
}
```

---

### 1.4 Toggle User Active Status
- **Endpoint**: `PATCH /api/admin/users/:id/status`
- **Authorization**: Super Admin only (`requireRole('super_admin')`)
- **Request Body**:
```json
{
  "is_active": 0
}
```
- **Success Response (200 OK)**:
```json
{
  "status": "success",
  "message": "User account status updated."
}
```

---

## 2. Error Responses

### 2.1 Unauthorized Access (401)
```json
{
  "status": "error",
  "message": "Authentication token missing or invalid."
}
```

### 2.2 Forbidden Operation (403)
```json
{
  "status": "error",
  "message": "Access denied. Requires Super Admin role."
}
```
