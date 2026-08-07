# Architectural Research & Technical Analysis: Supabase Auth Migration

**Feature**: [spec.md](file:///D:/newUser/Pre-sales-CRM/bosch_sales_dashboard/specs/003-supabase-auth-migration/spec.md) | **Plan**: [plan.md](file:///D:/newUser/Pre-sales-CRM/bosch_sales_dashboard/specs/003-supabase-auth-migration/plan.md)  
**Date**: 2026-08-01  

---

## 1. Supabase Auth Client SDK Strategy

### Decision
Integrate `@supabase/supabase-js` client SDK on both frontend (`frontend/src/supabaseClient.js`) and backend (`backend/utils/supabase.js`).
- Frontend: Use `supabase.auth.signInWithPassword()`, `supabase.auth.signOut()`, and `supabase.auth.onAuthStateChange()`.
- Backend: Use `supabase.auth.getUser(token)` within Express verification middleware to validate access tokens.

### Rationale
- **Industry Standard Identity**: Delegates password storage, salting, encryption, and OAuth/JWT signing to Supabase.
- **Automatic Refresh**: `supabase.auth.onAuthStateChange()` automatically handles background token refreshes without manual client timers.
- **Server Verification**: `supabase.auth.getUser(token)` provides fast server-side token validation against the Supabase Auth instance.

### Alternatives Considered
- *Custom JWT Verification with Public Keys*: Rejected in favor of official Supabase SDK methods for simpler maintainability and error handling.
- *Keeping Manual `auth_user` Table Auth*: Rejected as requested by user specification.

---

## 2. Application Profile & Role Binding Strategy

### Decision
Link authenticated Supabase identities (`user.id` or `user.email`) to the application profile table (`auth_user`). When a user authenticates via Supabase Auth, the backend queries `auth_user` by email/username to retrieve application role flags (`is_staff`, `is_superuser`). If no profile exists, create a default profile record.

### Rationale
- **Preserves Access Governance**: Retains existing role permissions without forcing database schema redesigns.
- **Decouples Identity from Application State**: Identity is handled by Supabase Auth; application authorization roles are managed in application profiles.

### Alternatives Considered
- *Storing Roles in Supabase App Metadata*: Considered, but linking to the existing `auth_user` profile table avoids breaking existing database queries across products, BOQs, and customers.

---

## 3. Legacy Code Deprecation Strategy

### Decision
Remove all custom password verification functions (`verifyDjangoPassword`, `crypto.pbkdf2Sync`, manual `bcrypt.compare`) from `backend/routes/auth.js` and remove all mock user fallbacks or static login handlers from `frontend/src/App.jsx`.

### Rationale
- **Eliminates Code Ambiguity**: Guarantees that zero legacy manual auth paths execute.
- **Security Hardening**: Prevents accidental fallbacks to weak or unverified password checks.

### Alternatives Considered
- *Keeping Legacy Code as Fallback*: Strongly rejected because dual authentication paths create security vulnerabilities and maintenance confusion.
