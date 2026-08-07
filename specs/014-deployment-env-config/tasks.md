# Tasks: Deployment Environment Configuration Update

**Input**: Design documents from `/specs/014-deployment-env-config/`

**Prerequisites**: [plan.md](./plan.md) (required), [spec.md](./spec.md) (required), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/env-config-contract.json](./contracts/env-config-contract.json)

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files or independent design modules)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Environment template files and centralized helper module creation

- [x] T001 Create `frontend/src/utils/api.js` helper module for API base URL and media URL resolution
- [x] T002 [P] Create `frontend/.env.example` template with `VITE_API_URL` documentation
- [x] T003 [P] Create `backend/.env.example` template with `FRONTEND_URL`, `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `JWT_SECRET`, `NODE_ENV` documentation

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Centralized Axios baseURL setup before updating components

- [x] T004 Refactor `frontend/src/App.jsx` to import `API_BASE_URL` from `frontend/src/utils/api.js` and remove hardcoded `http://localhost:5000/api` string

**Checkpoint**: Foundation ready - component dynamic URL updates and backend CORS handling can begin

---

## Phase 3: User Story 1 - Environment-Aware Frontend API Resolution (Priority: P1) 🎯 MVP

**Goal**: Ensure all frontend REST API calls and static product image requests dynamically resolve using environment variables (`import.meta.env.VITE_API_URL`) without hardcoded backend URLs.

**Independent Test**: Build and run frontend with `VITE_API_URL` set and verify all requests target the configured origin.

### Implementation for User Story 1

- [x] T005 [US1] Update product media image URL in `frontend/src/pages/Ratecard.jsx` to use `getMediaUrl()` helper instead of hardcoded `http://localhost:5000`
- [x] T006 [P] [US1] Audit all frontend pages (`Dashboard.jsx`, `BOQGenerator.jsx`, `Reports.jsx`, `AdminManagement.jsx`, `Login.jsx`) to confirm 0 hardcoded backend URLs remain

**Checkpoint**: At this point, User Story 1 frontend API resolution is complete and testable independently

---

## Phase 4: User Story 2 - Dynamic & Secure Cross-Origin (CORS) Backend Handling (Priority: P1)

**Goal**: Update backend CORS configuration in `backend/server.js` to dynamically authorize origins defined in `process.env.FRONTEND_URL` (`https://bosch-sales-dashboard.vercel.app`) alongside local development origins (`http://localhost:5173`).

**Independent Test**: Send cross-origin requests with `Origin: https://bosch-sales-dashboard.vercel.app` and `Origin: http://localhost:5173` and verify CORS headers respond correctly.

### Implementation for User Story 2

- [x] T007 [US2] Update `cors` middleware origin configuration in `backend/server.js` to dynamically include origins from `process.env.FRONTEND_URL`
- [x] T008 [US2] Add origin normalization and trimming logic in `backend/server.js` to handle trailing slashes and comma-separated origin lists

**Checkpoint**: At this point, User Story 2 backend CORS policy handles Vercel and localhost requests seamlessly

---

## Phase 5: User Story 3 - Unbroken Authentication & Full Feature Preservation (Priority: P1)

**Goal**: Verify Supabase auth integration, JWT bearer tokens, session validation, product CRUD, BOQ generator, reports, and RBAC functionality remain 100% operational.

**Independent Test**: Execute full end-to-end user workflows in local and production preview builds.

### Implementation for User Story 3

- [x] T009 [US3] Verify Axios request interceptor attaches Bearer tokens correctly in `frontend/src/App.jsx`
- [x] T010 [US3] Verify global 401 unauthorized error interceptor behavior in `frontend/src/App.jsx`

**Checkpoint**: All user stories functional and backward compatible with zero regressions

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Build verification and deployment quickstart validation

- [x] T011 Run production build validation `npm run build` in `frontend` directory to ensure 0 build errors
- [x] T012 Execute full quickstart manual testing validation per `specs/014-deployment-env-config/quickstart.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - starts immediately.
- **Foundational (Phase 2)**: Depends on Phase 1 - BLOCKS User Story implementation.
- **User Story 1 (Phase 3)**: Depends on Phase 2 - MVP Frontend API resolution.
- **User Story 2 (Phase 4)**: Depends on Phase 1 - Backend CORS policy setup.
- **User Story 3 (Phase 5)**: Depends on Phase 3 & 4 - Auth & feature regression validation.
- **Polish (Phase 6)**: Depends on all User Story phases completion.

---

## Implementation Strategy

### Incremental Delivery

1. Complete Setup + Foundational -> Foundation ready
2. Add User Story 1 -> Test independently -> Deploy/Demo (MVP!)
3. Add User Story 2 -> Test independently -> Deploy/Demo
4. Add User Story 3 -> Test independently -> Deploy/Demo
5. Each story adds value without breaking previous stories
