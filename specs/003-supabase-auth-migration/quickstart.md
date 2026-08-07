# Developer Quickstart & Supabase Auth Migration Guide

**Feature**: [spec.md](file:///D:/newUser/Pre-sales-CRM/bosch_sales_dashboard/specs/003-supabase-auth-migration/spec.md) | **Plan**: [plan.md](file:///D:/newUser/Pre-sales-CRM/bosch_sales_dashboard/specs/003-supabase-auth-migration/plan.md) | **Data Model**: [data-model.md](file:///D:/newUser/Pre-sales-CRM/bosch_sales_dashboard/specs/003-supabase-auth-migration/data-model.md) | **API Contracts**: [api-contracts.md](file:///D:/newUser/Pre-sales-CRM/bosch_sales_dashboard/specs/003-supabase-auth-migration/contracts/api-contracts.md)  
**Date**: 2026-08-01  

---

## 1. Environment Verification

Ensure the backend and frontend `.env` files contain valid Supabase credentials:

```env
SUPABASE_URL="https://your-project.supabase.co"
SUPABASE_KEY="your-anon-or-service-key"
```

---

## 2. Testing Procedures

### Procedure A: Supabase Auth Login & Token Issuance
1. Start backend server: `cd backend && npm run dev`
2. Send login request to `/api/auth/login` with email and password.
3. Confirm response returns a valid Supabase access token and mapped application user profile (`is_staff`, `is_superuser`).

### Procedure B: Bearer Token Backend Verification
1. Copy the returned Supabase access token.
2. Send request to `/api/auth/validate` with header `Authorization: Bearer <token>`.
3. Confirm `200 OK` response returning user profile.
4. Send request without token or with malformed token; confirm `401 Unauthorized` error response.

### Procedure C: Legacy Code Removal Verification
Run grep search across codebase to ensure zero legacy password functions remain:
```bash
grep -rn "verifyDjangoPassword" backend/
grep -rn "pbkdf2Sync" backend/
```
- **Expected**: 0 matches found.
