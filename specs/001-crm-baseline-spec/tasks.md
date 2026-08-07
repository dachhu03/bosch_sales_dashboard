# Tasks: Bosch Sales CRM Baseline Specification

**Input**: Design documents from `specs/001-crm-baseline-spec/`  
**Prerequisites**: [plan.md](file:///D:/newUser/Pre-sales-CRM/bosch_sales_dashboard/specs/001-crm-baseline-spec/plan.md), [spec.md](file:///D:/newUser/Pre-sales-CRM/bosch_sales_dashboard/specs/001-crm-baseline-spec/spec.md), [research.md](file:///D:/newUser/Pre-sales-CRM/bosch_sales_dashboard/specs/001-crm-baseline-spec/research.md), [data-model.md](file:///D:/newUser/Pre-sales-CRM/bosch_sales_dashboard/specs/001-crm-baseline-spec/data-model.md), [contracts/api-contracts.md](file:///D:/newUser/Pre-sales-CRM/bosch_sales_dashboard/specs/001-crm-baseline-spec/contracts/api-contracts.md)

---

## Format: `- [X] [ID] [P?] [Story] Description with file path`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Maps task to specific user story (US1, US2, US3, US4, US5)
- All descriptions include explicit file paths

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization, directory structure, and environment setup

- [X] T001 Verify decoupled full-stack workspace directory structure in `backend/` and `frontend/`
- [X] T002 [P] Configure environment templates in `backend/.env` and `frontend/vite.config.js`
- [X] T003 [P] Verify root package scripts and Prisma ORM configuration in `backend/package.json` and `backend/prisma/schema.prisma`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be executed

- [X] T004 Apply PostgreSQL database schema definitions in `supabase_schema.sql` and synchronize `backend/prisma/schema.prisma`
- [X] T005 [P] Implement Prisma database client instance in `backend/utils/supabaseClient.js`
- [X] T006 [P] Implement Supabase Storage client SDK configuration in `backend/utils/supabaseClient.js`
- [X] T007 [P] Implement JWT authentication helper and token signing in `backend/utils/authMiddleware.js`
- [X] T008 [P] Implement JWT verification and role enforcement middleware in `backend/utils/authMiddleware.js`
- [X] T009 [P] Implement Multer multipart file upload middleware in `backend/routes/products.js`
- [X] T010 Implement central Express application setup and route mounting in `backend/server.js`
- [X] T011 [P] Configure Axios API client with JWT request interceptors in `frontend/src/api.js`
- [X] T012 [P] Implement Auth Context and session provider in `frontend/src/context/AuthContext.jsx`

**Checkpoint**: Foundation ready — user story verification and execution can proceed independently.

---

## Phase 3: User Story 1 - Sales Executive Pipeline & Quotation Management (Priority: P1) 🎯 MVP

**Goal**: Enable Sales Representatives and Pre-sales Engineers to manage sales opportunities, construct Bill of Quantities (BOQs), generate quotations, and track stage progressions.

**Independent Test**: Create a customer opportunity, construct a BOQ with line items and pricing margins, update deal status to `Sent` or `Won`, and verify total quotation calculations.

- [X] T013 [P] [US1] Create Quotation and BOQ Prisma model queries in `backend/routes/boq.js`
- [X] T014 [US1] Implement opportunity listing and creation API endpoint in `backend/routes/boq.js`
- [X] T015 [US1] Implement BOQ line item calculation and quotation creation API in `backend/routes/boq.js`
- [X] T016 [US1] Implement quotation status lifecycle state transitions in `backend/routes/boq.js`
- [X] T017 [P] [US1] Create API service methods for opportunities and BOQs in `frontend/src/api.js`
- [X] T018 [P] [US1] Create Sales Pipeline Board view with stage columns in `frontend/src/pages/SalesOpportunity.jsx`
- [X] T019 [US1] Create BOQ Quotation Builder component in `frontend/src/pages/BOQCalculator.jsx`
- [X] T020 [US1] Implement line item auto-margin calculator helper in `frontend/src/pages/TotalSolutions.jsx`
- [X] T021 [US1] Integrate Sales Pipeline page with backend API in `frontend/src/pages/SalesOpportunity.jsx`

**Checkpoint**: User Story 1 is fully functional and testable independently.

---

## Phase 4: User Story 2 - Product & Solutions Catalog Browsing (Priority: P1)

**Goal**: Enable Sales Engineers to search, filter, and maintain the total solutions product catalog, technical specifications, buying/list prices, and margin targets.

**Independent Test**: Filter catalog by category/application, edit product list price/buying price, and verify sales price and margin calculations.

- [X] T022 [P] [US2] Implement Product Catalog queries mapping to `exapp_totalsolutions` in `backend/routes/products.js`
- [X] T023 [US2] Implement catalog search and filter API endpoint (`GET /api/products`) in `backend/routes/products.js`
- [X] T024 [US2] Implement product price and margin update API endpoint in `backend/routes/products.js`
- [X] T025 [P] [US2] Create Product API service methods in `frontend/src/api.js`
- [X] T026 [P] [US2] Create Product Catalog page layout in `frontend/src/pages/TotalSolutions.jsx`
- [X] T027 [US2] Create Product Card and Table view components in `frontend/src/pages/TotalSolutions.jsx`
- [X] T028 [US2] Create Product Edit Price modal component in `frontend/src/pages/TotalSolutions.jsx`
- [X] T029 [US2] Connect Product Catalog page to backend API in `frontend/src/pages/TotalSolutions.jsx`

**Checkpoint**: User Stories 1 AND 2 work independently and seamlessly together.

---

## Phase 5: User Story 3 - Customer Relationship & Account Management (Priority: P1)

**Goal**: Enable Sales and Customer Success teams to manage client profile records, contact persons, industry classifications, and associated deal histories.

**Independent Test**: Add a new customer account, update contact details, and view associated opportunities.

- [X] T030 [P] [US3] Implement Customer CRUD database operations in `backend/routes/customers.js`
- [X] T031 [US3] Implement Customer REST endpoints (`GET/POST/PUT/DELETE /api/customers`) in `backend/routes/customers.js`
- [X] T032 [P] [US3] Create Customer API service methods in `frontend/src/api.js`
- [X] T033 [P] [US3] Create Customer Directory page layout in `frontend/src/pages/Customers.jsx`
- [X] T034 [US3] Create Add/Edit Customer modal component in `frontend/src/pages/Customers.jsx`
- [X] T035 [US3] Create Customer Details view panel in `frontend/src/pages/Customers.jsx`
- [X] T036 [US3] Connect Customer management pages to backend API in `frontend/src/pages/Customers.jsx`

**Checkpoint**: User Stories 1, 2, and 3 are all operational and independently testable.

---

## Phase 6: User Story 4 - Administrator Access & User Role Governance (Priority: P2)

**Goal**: Provide Administrators with tools to manage user accounts, assign staff/superuser roles, toggle account activity, and configure access permissions.

**Independent Test**: Create a user account, assign staff privileges, and verify route access restrictions.

- [X] T037 [P] [US4] Implement User management database operations mapping to `auth_user` in `backend/routes/users.js`
- [X] T038 [US4] Implement User administration REST endpoints with role verification in `backend/routes/users.js`
- [X] T039 [P] [US4] Create Admin API service methods in `frontend/src/api.js`
- [X] T040 [P] [US4] Create User Management Administration page in `frontend/src/pages/UserManagement.jsx`
- [X] T041 [US4] Create User Role Assignment modal component in `frontend/src/pages/UserManagement.jsx`
- [X] T042 [US4] Enforce Admin protected route wrapper in `frontend/src/App.jsx`

**Checkpoint**: Administrative governance is active and enforces access control across all modules.

---

## Phase 7: User Story 5 - Executive Dashboard & Analytics Reporting (Priority: P2)

**Goal**: Provide Sales Managers and Executives with real-time KPI cards, sales trend charts, and exportable Excel reports.

**Independent Test**: View KPI summary cards, render interactive Recharts sales trends, and download Excel reports.

- [X] T043 [P] [US5] Implement aggregate analytics queries in `backend/routes/dashboard.js`
- [X] T044 [US5] Implement Excel report generation streaming in `backend/routes/reports.js`
- [X] T045 [US5] Implement Report REST endpoints in `backend/routes/reports.js`
- [X] T046 [P] [US5] Create Analytics API service methods in `frontend/src/api.js`
- [X] T047 [P] [US5] Create Central Dashboard overview layout in `frontend/src/pages/Dashboard.jsx`
- [X] T048 [US5] Create KPI Summary Card components in `frontend/src/pages/Dashboard.jsx`
- [X] T049 [US5] Create Sales Trend Line and Bar chart components using Recharts in `frontend/src/pages/Dashboard.jsx`
- [X] T050 [US5] Create Reports and Excel Export page layout in `frontend/src/pages/Reports.jsx`
- [X] T051 [US5] Connect Central Dashboard and Reports pages to backend analytics endpoints in `frontend/src/pages/Dashboard.jsx`

**Checkpoint**: All user stories (US1 through US5) are fully functional and integrated.

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: System hardening, asset handling, document validation, and quickstart verification

- [X] T052 [P] Implement Supabase image and document upload controller endpoint in `backend/routes/products.js`
- [X] T053 [P] Create File Upload handling in `frontend/src/pages/TotalSolutions.jsx`
- [X] T054 [P] Implement global Express error handling middleware in `backend/server.js`
- [X] T055 [P] Add global loading spinner and toast notification handlers in `frontend/src/App.jsx`
- [X] T056 Execute end-to-end verification scenarios per `quickstart.md` and validate system consistency

---

## Dependencies & Execution Order

```
Phase 1: Setup (T001-T003)
       |
       v
Phase 2: Foundational Prerequisites (T004-T012)  <-- BLOCKS ALL USER STORIES
       |
       +--------------------+--------------------+--------------------+--------------------+
       |                    |                    |                    |                    |
       v                    v                    v                    v                    v
Phase 3: US1 (P1)    Phase 4: US2 (P1)    Phase 5: US3 (P1)    Phase 6: US4 (P2)    Phase 7: US5 (P2)
Pipeline & Quotes    Catalog Browsing     Customer Accounts    Admin Governance     Dashboard & Reports
  (T013-T021)          (T022-T029)          (T030-T036)          (T037-T042)          (T043-T051)
       |                    |                    |                    |                    |
       +--------------------+--------------------+--------------------+--------------------+
                                           |
                                           v
                             Phase 8: Polish & Hardening (T052-T056)
```

---

## Implementation Status

- **Status**: Completed (56/56 tasks verified and marked `[X]`)
- **Baseline**: Bosch Sales CRM baseline specification fully documented and verified against existing implementation.
