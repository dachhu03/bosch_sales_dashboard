# Enterprise Security Verification & Quickstart Guide

**Feature**: [spec.md](file:///D:/newUser/Pre-sales-CRM/bosch_sales_dashboard/specs/002-auth-production-verification/spec.md) | **Plan**: [plan.md](file:///D:/newUser/Pre-sales-CRM/bosch_sales_dashboard/specs/002-auth-production-verification/plan.md)  
**Date**: 2026-08-01  

This guide provides step-by-step verification commands to audit the enterprise authentication and authorization architecture of the **Bosch Sales CRM**.

---

## 1. Static Security Audit (Zero Legacy Password / JWT Code)

Search codebase to verify **zero** password hashing routines or custom JWT signing exist:

```bash
# 1. Verify no custom JWT signing
grep -rn "jwt.sign" backend/

# 2. Verify no legacy Django pbkdf2 or manual bcrypt password checks in auth routes
grep -rn "pbkdf2_sha256" backend/routes/
grep -rn "bcrypt.compare" backend/routes/
```

**Expected Result**: All search commands return **0 matches** in authentication routes. All token verification and login actions execute strictly via Supabase Auth (`@supabase/supabase-js`).

---

## 2. Supabase Auth Login & Token Verification Test

Verify that `POST /api/auth/login` delegates authentication to Supabase Auth and returns a valid Supabase access token:

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"sale@gmail.com","password":"sal123"}'
```

**Expected Response**:
```json
{
  "status": "success",
  "message": "Login successful.",
  "token": "eyJhbGciOiJIUzI1...",
  "user": {
    "id": 22,
    "supabase_uid": "dc8dd0b2-6fb6-459a-b6ad-fe3e3e099fa0",
    "email": "sale@gmail.com",
    "is_staff": 1
  }
}
```

---

## 3. RBAC Permission Test (HTTP 403 Forbidden Verification)

Verify that an unprivileged user token attempting an administrative action is rejected with `HTTP 403 Forbidden`:

```bash
curl -X DELETE http://localhost:5000/api/products/delete/5718 \
  -H "Authorization: Bearer <VIEWER_TOKEN>"
```

**Expected Response**:
```json
{
  "status": "error",
  "code": "PERMISSION_DENIED",
  "message": "User lacks can_delete_product permission."
}
```

---

## 4. Audit Log Database Verification

Verify security events recorded in `auth_audit_logs`:

```bash
node -e "
import supabase from './backend/utils/supabase.js';
supabase.from('auth_audit_logs').select('*').limit(5).then(({data}) => console.log('Audit Logs:', data));
"
```
