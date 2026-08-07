# Implementation Plan: Authentication Migration to Supabase Auth

**Branch**: `003-supabase-auth-migration` | **Date**: 2026-08-01 | **Spec**: [spec.md](file:///D:/newUser/Pre-sales-CRM/bosch_sales_dashboard/specs/003-supabase-auth-migration/spec.md)

**Input**: Feature specification from `specs/003-supabase-auth-migration/spec.md`

## Summary

This implementation plan defines the migration of the Bosch Sales CRM authentication system from custom, manual database table checks to **Supabase Auth**. The migration will utilize `@supabase/supabase-js` on the frontend for `signInWithPassword`, `signOut`, and `onAuthStateChange` session management. The Express backend will use the Supabase Admin SDK (`supabase.auth.getUser(token)`) to verify bearer tokens and map authenticated Supabase user IDs/emails to application profile records (`auth_user`) to resolve role permissions (`is_staff`, `is_superuser`). Manual password hashing algorithms (`pbkdf2_sha256`, manual bcrypt comparators) will be completely removed.

---

## Technical Context

**Language/Version**: Node.js (ES6+), React 18+ (JavaScript)  
**Primary Dependencies**: `@supabase/supabase-js`, Express.js, React Router, Axios, LocalStorage  
**Storage**: Supabase Auth service (`auth.users`), PostgreSQL (`auth_user` profile table for roles)  
**Testing**: Jest, Supertest (backend API token verification), React Testing Library (Supabase Auth provider)  
**Target Platform**: Node.js server environment; modern desktop browsers  
**Project Type**: Full-stack Web Application (`frontend` + `backend`)  
**Performance Goals**: Supabase auth token verification < 200ms, frontend session restoration < 150ms  
**Constraints**: Preserve existing application layout, pages, and business logic; link Supabase identities to `auth_user` profiles; deprecate manual `pbkdf2` verification  
**Scale/Scope**: Enterprise pre-sales CRM authentication migration and security hardening  

---

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Principle I: Modular Architecture**: PASS — Clear separation between `@supabase/supabase-js` Auth client and application business logic.
- **Principle II: REST Protocol**: PASS — Backend middleware verifies Supabase bearer tokens via HTTP `Authorization: Bearer <token>`.
- **Principle III: Testability**: PASS — Supabase Auth provider and verification middleware are isolated and mockable.
- **Principle IV: Integration & Data Integrity**: PASS — Supabase user identities map 1-to-1 with PostgreSQL `auth_user` profile records via email/UID.
- **Principle V: Observability & Security**: PASS — Native Supabase Auth manages cryptographically signed tokens and handles expiration automatically.

---

## Project Structure

### Documentation (this feature)

```text
specs/003-supabase-auth-migration/
├── plan.md              # This file (implementation plan)
├── research.md          # Phase 0 output (Supabase Auth migration decisions & analysis)
├── data-model.md        # Phase 1 output (Supabase auth.users, auth_user profiles, role mapping)
├── quickstart.md        # Phase 1 output (migration verification guide)
└── contracts/           # Phase 1 output (Supabase Auth REST API contracts)
    └── api-contracts.md # Login, Logout, Validate, User Profile endpoints
```

### Source Code (repository root)

```text
backend/
├── routes/
│   └── auth.js          # Express route using Supabase Auth SDK & profile mapping
├── utils/
│   └── supabase.js      # Supabase Admin client initialization
└── server.js            # Express app configuration & middleware mounting

frontend/
├── src/
│   ├── supabaseClient.js # Frontend Supabase Client initialization
│   ├── pages/
│   │   └── Login.jsx    # Login form utilizing Supabase Auth
│   └── App.jsx          # AuthContext using supabase.auth.onAuthStateChange & route guards
```

**Structure Decision**: Migration of `backend/routes/auth.js` and `frontend/src/App.jsx` to native `@supabase/supabase-js` Auth.

---

## Complexity Tracking

> *No constitution violations detected; baseline design maintains simplicity and direct alignment with existing code.*
