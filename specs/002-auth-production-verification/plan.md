# Implementation Plan: Authentication Production Verification & Enterprise Architecture

**Branch**: `002-auth-production-verification` | **Date**: 2026-08-01 | **Spec**: [spec.md](file:///D:/newUser/Pre-sales-CRM/bosch_sales_dashboard/specs/002-auth-production-verification/spec.md)

**Input**: Feature specification from `specs/002-auth-production-verification/spec.md`

## Summary

This implementation plan defines the enterprise architecture upgrade for the **Bosch Sales CRM** authentication system. Supabase Auth serves as the sole authentication provider (login, signup, session tokens, password reset, session restoration). The `auth_user` table is refactored into a pure business profile table linked to `auth.users` via immutable `supabase_uid` (UUID), storing zero password data. The Express backend verifies Supabase access tokens via `supabase.auth.getUser(token)`, loads user profile roles and RBAC permissions from `auth_user`, validates requests using Zod schemas, enforces database Row Level Security (RLS) policies, and records structured audit logs in `auth_audit_logs`.

---

## Technical Context

**Language/Version**: Node.js (ES6+), React 18+ (Vite)  
**Primary Dependencies**: `@supabase/supabase-js`, Express.js, Zod, React Router, Axios  
**Storage**: Supabase Auth (`auth.users`), PostgreSQL (`auth_user` profile table, `auth_audit_logs`, RLS policies)  
**Testing**: Jest, Supertest (backend API token/RBAC verification), React Testing Library (Supabase Auth session provider)  
**Target Platform**: Node.js server environment; modern desktop web browsers  
**Project Type**: Full-stack Web Application (`frontend` + `backend`)  
**Performance Goals**: Supabase token validation + profile RBAC lookup < 100ms average, page load session restoration < 150ms  
**Constraints**: Zero custom JWT generation, zero password storage in application tables, immutable `supabase_uid` foreign key linking  
**Scale/Scope**: Enterprise CRM authentication, RBAC authorization, RLS data protection, Zod payload validation, audit logging  

---

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Principle I: Modular Architecture**: PASS — Complete separation of Supabase Auth identity from `auth_user` profile RBAC.
- **Principle II: REST Protocol**: PASS — Standard HTTP `Authorization: Bearer <supabase_access_token>` header on all requests.
- **Principle III: Testability**: PASS — Express auth middleware, Zod validators, and RBAC permission checks are modular and unit testable.
- **Principle IV: Integration & Data Integrity**: PASS — Foreign key constraint links `auth_user.supabase_uid` to `auth.users.id`.
- **Principle V: Observability & Security**: PASS — Structured security event logging in `auth_audit_logs`, strict RLS policies on PostgreSQL tables, and clean HTTP 401/403 status responses.

---

## Project Structure

### Documentation (this feature)

```text
specs/002-auth-production-verification/
├── plan.md              # This file (implementation plan)
├── research.md          # Phase 0 output (enterprise auth architecture & security analysis)
├── data-model.md        # Phase 1 output (Supabase auth.users, auth_user profiles, RBAC matrix, RLS policies, audit logs)
├── quickstart.md        # Phase 1 output (enterprise security audit & verification guide)
└── contracts/           # Phase 1 output (Supabase Auth REST API contracts & Zod schemas)
    └── api-contracts.md # Endpoints, HTTP status codes, Zod validation schemas
```

### Source Code (repository root)

```text
backend/
├── middleware/
│   ├── authenticate.js   # Supabase access token validation & auth_user profile attachment
│   ├── rbac.js           # Role & explicit permission enforcement middleware
│   └── validateZod.js    # Zod schema request validation middleware
├── services/
│   └── auditService.js   # Security event logger (writes to auth_audit_logs)
├── routes/
│   └── auth.js           # Supabase Auth endpoints & profile management
└── server.js             # Express app setup, security headers, CORS & RLS configuration

frontend/
├── src/
│   ├── supabaseClient.js # Supabase client instance
│   ├── context/
│   │   └── AuthContext.jsx # Native Supabase session restoration, token refresh & RBAC state
│   ├── pages/
│   │   └── Login.jsx     # Supabase Auth login form
│   └── App.jsx           # Protected route guards & RBAC page routing
```

**Structure Decision**: Decoupled enterprise architecture separating Supabase Auth, Express RBAC middleware, Zod validation, and PostgreSQL RLS.

---

## Complexity Tracking

> *No constitution violations detected; baseline design maintains enterprise simplicity and strict separation of concerns.*
