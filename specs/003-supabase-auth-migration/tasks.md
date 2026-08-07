# Tasks: Authentication Migration to Supabase Auth

**Input**: Design documents from `specs/003-supabase-auth-migration/`  
**Prerequisites**: [plan.md](file:///D:/newUser/Pre-sales-CRM/bosch_sales_dashboard/specs/003-supabase-auth-migration/plan.md), [spec.md](file:///D:/newUser/Pre-sales-CRM/bosch_sales_dashboard/specs/003-supabase-auth-migration/spec.md), [research.md](file:///D:/newUser/Pre-sales-CRM/bosch_sales_dashboard/specs/003-supabase-auth-migration/research.md), [data-model.md](file:///D:/newUser/Pre-sales-CRM/bosch_sales_dashboard/specs/003-supabase-auth-migration/data-model.md), [contracts/api-contracts.md](file:///D:/newUser/Pre-sales-CRM/bosch_sales_dashboard/specs/003-supabase-auth-migration/contracts/api-contracts.md)

---

## Format: `- [X] [ID] [P?] [Story] Description with file path`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Maps task to specific user story (US1, US2, US3, US4, US5)
- All descriptions include explicit file paths

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Dependency verification and environment setup for Supabase Auth SDK

- [X] T001 Verify Supabase SDK dependency `@supabase/supabase-js` in `backend/package.json` and `frontend/package.json`
- [X] T002 [P] Verify Supabase environment variables `SUPABASE_URL` and `SUPABASE_KEY` in `backend/.env`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core Supabase Auth SDK clients that MUST be configured before user stories can execute

- [X] T003 Configure Supabase Admin Client SDK instance in `backend/utils/supabase.js`
- [X] T004 [P] Create frontend Supabase client initialization in `frontend/src/supabaseClient.js`

**Checkpoint**: Foundational setup ready — Supabase Auth story execution can proceed.

---

## Phase 3: User Story 1 - Supabase Native User Login & Token Issuance (Priority: P1) 🎯 MVP

**Goal**: Authenticate user credentials natively through Supabase Auth services and issue session tokens.

**Independent Test**: Submit valid credentials to `/api/auth/login`, receive a Supabase session token, and confirm invalid credentials return HTTP 401.

- [X] T005 [P] [US1] Implement Supabase Auth login request handler in `backend/routes/auth.js`
- [X] T006 [US1] Issue Supabase session access token upon successful authentication in `backend/routes/auth.js`
- [X] T007 [P] [US1] Update Login form component to use Supabase Auth in `frontend/src/pages/Login.jsx`
- [X] T008 [US1] Handle invalid credential error feedback in `frontend/src/pages/Login.jsx`

**Checkpoint**: User Story 1 is fully functional and testable independently.

---

## Phase 4: User Story 2 - User Role & Permission Mapping (Priority: P1)

**Goal**: Map authenticated Supabase user identities to application profile roles (`is_staff`, `is_superuser`).

**Independent Test**: Log in via Supabase Auth; verify response returns user profile role flags (`is_staff`, `is_superuser`) mapped from `auth_user`.

- [X] T009 [P] [US2] Implement user profile lookup in `auth_user` table by Supabase identity email/username in `backend/routes/auth.js`
- [X] T010 [US2] Attach profile role flags (`is_staff`, `is_superuser`) to login response payload in `backend/routes/auth.js`
- [X] T011 [P] [US2] Update AuthContext to store user profile role claims in `frontend/src/App.jsx`
- [X] T012 [US2] Enforce role-based UI view rendering based on profile roles in `frontend/src/App.jsx`

**Checkpoint**: User Stories 1 AND 2 work independently and seamlessly together.

---

## Phase 5: User Story 3 - Backend API Token Verification via Supabase (Priority: P1)

**Goal**: Verify incoming Bearer tokens on protected REST endpoints using Supabase Auth SDK.

**Independent Test**: Send API requests with valid Supabase tokens (succeeds) vs. missing/invalid tokens (returns HTTP 401).

- [X] T013 [P] [US3] Implement `verifyToken` middleware using `supabase.auth.getUser(token)` in `backend/routes/auth.js`
- [X] T014 [US3] Extract Bearer token from `Authorization` headers or cookies in `backend/routes/auth.js`
- [X] T015 [US3] Reject requests with missing, invalid, or expired tokens with HTTP 401 in `backend/routes/auth.js`
- [X] T016 [US3] Protect session validation endpoint (`GET /api/auth/validate`) in `backend/routes/auth.js`

**Checkpoint**: User Stories 1, 2, and 3 are operational and independently testable.

---

## Phase 6: User Story 4 - Deprecation of Legacy Manual `auth_user` Logic (Priority: P2)

**Goal**: Completely remove custom `pbkdf2_sha256` hashing and manual bcrypt comparisons.

**Independent Test**: Run code search across backend files; verify 0 matches for manual password hashing functions.

- [X] T017 [P] [US4] Remove legacy `verifyDjangoPassword` and `crypto.pbkdf2Sync` functions from `backend/routes/auth.js`
- [X] T018 [P] [US4] Remove manual bcrypt hash comparisons from `backend/routes/auth.js`
- [X] T019 [US4] Remove hardcoded admin auto-seeding fallbacks from `backend/routes/auth.js`

**Checkpoint**: Zero legacy password hashing functions remain in the codebase.

---

## Phase 7: User Story 5 - Supabase Session Management & Secure Logout (Priority: P2)

**Goal**: Terminate Supabase Auth sessions upon logout and handle automatic token restoration.

**Independent Test**: Click Logout button; confirm `supabase.auth.signOut()` executes, clearing local session state.

- [X] T020 [P] [US5] Implement `logout` handler using `supabase.auth.signOut()` in `frontend/src/App.jsx`
- [X] T021 [US5] Implement logout API endpoint (`POST /api/auth/logout`) clearing session cookies in `backend/routes/auth.js`
- [X] T022 [US5] Implement `supabase.auth.onAuthStateChange()` listener for automatic session restoration in `frontend/src/App.jsx`

**Checkpoint**: All user stories (US1 through US5) are fully functional and integrated.

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Error message security review and quickstart scenario verification

- [X] T023 [P] Verify generic authentication error messages in `backend/routes/auth.js`
- [X] T024 Execute quickstart verification procedures per `quickstart.md`

---

## Implementation Status

- **Status**: Completed (24/24 tasks verified and marked `[X]`)
- **Verification Result**: 100% of authentication operations transmit live requests to Supabase Auth services (`supabase.auth.signInWithPassword`, `supabase.auth.getUser`, `supabase.auth.signOut`), link identities to application profiles (`auth_user`), and contain zero legacy `pbkdf2_sha256` or manual bcrypt password comparators.
