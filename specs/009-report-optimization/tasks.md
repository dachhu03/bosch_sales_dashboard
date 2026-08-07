# Tasks: Report Optimization & Solution Management

**Input**: Design documents from `/specs/009-report-optimization/`

**Prerequisites**: [`plan.md`](file:///D:/newUser/Pre-sales-CRM/bosch_sales_dashboard/specs/009-report-optimization/plan.md), [`spec.md`](file:///D:/newUser/Pre-sales-CRM/bosch_sales_dashboard/specs/009-report-optimization/spec.md), [`research.md`](file:///D:/newUser/Pre-sales-CRM/bosch_sales_dashboard/specs/009-report-optimization/research.md), [`data-model.md`](file:///D:/newUser/Pre-sales-CRM/bosch_sales_dashboard/specs/009-report-optimization/data-model.md), [`contracts/report-optimization-api.md`](file:///D:/newUser/Pre-sales-CRM/bosch_sales_dashboard/specs/009-report-optimization/contracts/report-optimization-api.md)

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (`[US1]`, `[US2]`, `[US3]`, `[US4]`)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project environment and verification

- [x] T001 Verify frontend and backend project structure and dependencies in `frontend/package.json` and `backend/package.json`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core backend API endpoints and schema mappers required by all user stories

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T002 [P] Update DB row mapper and response builders in `backend/routes/boq.js` to return `preparedBy`, `approvalStatus`, `usageCount`, `isPriority`, and `approach`
- [x] T003 [P] Implement `DELETE /api/boq/:id` and `POST /api/boq/:id/increment-usage` endpoint handlers in `backend/routes/boq.js`

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - Search & Filter BOQs by Channel & Highlight Top Projects (Priority: P1) 🎯 MVP

**Goal**: Enable real-time keyword search across BOQs, purchase channel dropdown filtering ("SI" vs "Direct Purchase"), and visual highlighting for high-value and high-priority projects.

**Independent Test**: Type a keyword in the search bar, toggle the purchase channel dropdown, and verify that matching BOQ rows filter instantly while displaying gold/amber high-value badges and priority tags.

### Implementation for User Story 1

- [x] T004 [P] [US1] Create search keyword state and purchase channel dropdown filter UI controls in `frontend/src/pages/Reports.jsx`
- [x] T005 [US1] Implement multi-field filtering logic (project name, quote number, solution, client, approach) in `frontend/src/pages/Reports.jsx`
- [x] T006 [US1] Add visual badges and card styling for high-value ($\ge ₹10,000,000$) and high-priority projects in `frontend/src/pages/Reports.jsx`

**Checkpoint**: User Story 1 fully functional and independently testable (MVP)

---

## Phase 4: User Story 3 - Interactive Solution Click to Auto-Populate BOQ Generator (Priority: P1)

**Goal**: Enable clicking any solution entry in Reports to navigate to the BOQ Generator and auto-populate all line items and project configuration.

**Independent Test**: Click a solution row/card in Reports, confirm route transition to `/boq`, and verify that hardware, software, services, AMC, and project fields are pre-populated.

### Implementation for User Story 3

- [x] T007 [P] [US3] Add solution row click handler in `frontend/src/pages/Reports.jsx` navigating to `/boq` with state `{ loadBoqId: boq.id }` and calling `POST /api/boq/:id/increment-usage`
- [x] T008 [US3] Update `frontend/src/pages/BOQGenerator.jsx` to parse `location.state.loadBoqId` on mount and auto-populate hardware, software, services, AMC, and totals

**Checkpoint**: User Story 3 fully functional and testable

---

## Phase 5: User Story 2 - Solution Metadata, Approval Status & Usage Badging (Priority: P2)

**Goal**: Display author attribution ("Prepared By"), approval workflow status ("Pending" / "Approved"), and visual callouts for the "Most Used Solution".

**Independent Test**: Inspect solution rows in Reports to verify "Prepared By" username tags, approval status badges, and the "Most Used Solution" badge on the top-utilized solution.

### Implementation for User Story 2

- [x] T009 [P] [US2] Render "Prepared By" author attribution and "Pending" / "Approved" status badges on solution entries in `frontend/src/pages/Reports.jsx`
- [x] T010 [US2] Implement maximum `usageCount` computation and display "Most Used Solution" highlight badge in `frontend/src/pages/Reports.jsx`

**Checkpoint**: User Story 2 fully functional and testable

---

## Phase 6: User Story 4 - Solution Row Deletion (Priority: P3)

**Goal**: Provide a Delete button on each solution row with a confirmation modal to remove obsolete solutions safely.

**Independent Test**: Click Delete on a solution row, verify confirmation dialog appears, confirm deletion, and verify removal from report table and summary statistics.

### Implementation for User Story 4

- [x] T011 [P] [US4] Add Delete button to solution rows and create confirmation modal UI dialog in `frontend/src/pages/Reports.jsx`
- [x] T012 [US4] Implement confirmation action handler invoking `DELETE /api/boq/:id` and updating local `boqList` state in `frontend/src/pages/Reports.jsx`

**Checkpoint**: User Story 4 fully functional and testable

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: UI refinement, empty states, and E2E validation

- [x] T013 [P] Add smooth transition animations, empty state search reset button, and toast alerts in `frontend/src/pages/Reports.jsx`
- [x] T014 Execute full validation suite defined in [`specs/009-report-optimization/quickstart.md`](file:///D:/newUser/Pre-sales-CRM/bosch_sales_dashboard/specs/009-report-optimization/quickstart.md)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - starts immediately
- **Foundational (Phase 2)**: Depends on Setup - BLOCKS user story phases
- **User Stories (Phase 3+)**: Depend on Foundational completion
  - Phase 3 (US1) $\rightarrow$ Phase 4 (US3) $\rightarrow$ Phase 5 (US2) $\rightarrow$ Phase 6 (US4)
- **Polish (Phase 7)**: Depends on completion of all user story phases

---

## Parallel Opportunities

- **Phase 2**: T002 (row mapper) and T003 (DELETE / increment routes) can run in parallel in `backend/routes/boq.js`.
- **Phase 3 & Phase 4**: T004 (search state UI) and T007 (navigation click handler) can be prepared in parallel.
- **Phase 5 & Phase 6**: T009 (metadata rendering) and T011 (delete UI modal) can be prepared in parallel.

---

## Implementation Strategy

### MVP First (User Story 1 & 3)

1. Complete Phase 1 & Phase 2 (Setup & Foundational backend updates).
2. Complete Phase 3 (User Story 1: Search, Channel Filtering & Highlights).
3. Complete Phase 4 (User Story 3: Click-to-Populate Navigation).
4. **VALIDATE MVP**: Verify search, filtering, and auto-population.

### Incremental Delivery

1. Complete Phase 5 (User Story 2: Author, Status & Most Used Solution badges).
2. Complete Phase 6 (User Story 4: Solution Deletion with Confirmation).
3. Complete Phase 7 (Polish & Quickstart validation).
