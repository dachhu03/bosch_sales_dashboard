# Implementation Plan: Reports Section Optimization and Feature Enhancement

**Branch**: `015-reports-section-enhancements` | **Date**: 2026-08-13 | **Spec**: [`spec.md`](spec.md)

**Input**: Feature specification from `/specs/015-reports-section-enhancements/spec.md`

## Summary

Upgrade the existing Reports section from a basic quotation list into a complete management reporting dashboard. The key enhancements include:
1. **Quotation Performance Analytics**: Monthly and yearly analysis of quoted sales volume and profit margin trends with interactive Recharts charts and summary KPI cards.
2. **Normalized Status Tracking**: Status tracking across three operational states (`Closed`, `In Review`, `Rejected`).
3. **Editable Remarks / Feedback**: Dedicated notes column allowing authorized users to record rejection reasons, improvement feedback, and follow-up remarks.
4. **Rich Multi-Criteria Filtering**: Filter and search controls across Year, Month, Status, Channel (SI vs Direct), and Keyword search.
5. **Backend API Optimization**: Streamlined database query projections (`GET /api/reports/summary`) excluding heavy line-item JSON arrays, reducing payload size by >80% to achieve initial load times <1.5s and instant client-side filter updates <300ms.
6. **RBAC Protection & Validation**: Server-side RBAC authorization (`requirePermission('boq:write')` / `requireRole('super_admin')`) and input validation ensuring only authorized users can update status and remarks, while preserving all existing Auth, BOQ generator, Rate Card, and Admin features without regression.

## Technical Context

**Language/Version**: JavaScript (Node.js ESM ES2022 / React 18 JSX)  

**Primary Dependencies**: Express 4, `@supabase/supabase-js` v2, React 18, Vite 5, React Router v6, Axios, Recharts 2, Lucide-React, Framer Motion, Tailwind CSS v3  

**Storage**: Supabase PostgreSQL (`exapp_boq` table storing metadata and `totals` JSONB object with `approvalStatus` and `remarks`)  

**Testing**: E2E scenario validation via [`quickstart.md`](quickstart.md)  

**Target Platform**: Modern Web Browsers (Chrome, Edge, Firefox, Safari)  

**Project Type**: Web application (`backend/` Express server + `frontend/` React SPA)  

**Performance Goals**: Initial reports dashboard load time < 1.5s; filter update latency < 300ms  

**Constraints**: Zero breaking database schema DDL changes; zero regressions on Auth, RBAC, BOQ generator, or Product Catalog modules; strict RBAC validation on all mutation endpoints  

**Scale/Scope**: Enterprise pre-sales CRM reporting across active BOQ quotations  

## Constitution Check

*GATE: Passed before Phase 0 research. Re-checked post Phase 1 design.*

- **Modular Reporting Architecture**: PASS - All report analytics, status updates, and remarks mutation endpoints are encapsulated in `backend/routes/reports.js`.
- **Security & RBAC Enforcement**: PASS - Read endpoints protected by `verifyToken` and `requirePermission('reports:read')`. Mutation endpoints (`PATCH /status` and `PATCH /remarks`) strictly guarded by `requirePermission('boq:write')` or `requireRole('super_admin')`.
- **Performance Optimization**: PASS - Database query projection selects only metadata and totals (`id`, `project_name`, `project_location`, `quotation_number`, `approach`, `solution_title`, `totals`, `created_at`), omitting heavy `hardware`, `software`, `services`, `amc` arrays.
- **Zero Regression**: PASS - Isolated reporting module ensures zero side effects on BOQ calculation engine, ratecard management, or user management.

## Project Structure

### Documentation (this feature)

```text
specs/015-reports-section-enhancements/
├── plan.md              # Implementation plan
├── research.md          # Phase 0 architectural research
├── data-model.md        # Phase 1 data entities and status state machine
├── quickstart.md        # End-to-end validation scenarios
└── contracts/
    └── reports-api.md   # API request/response specifications
```

### Source Code (repository root)

```text
backend/
├── routes/
│   ├── reports.js       # NEW: Optimized summary analytics, RBAC-guarded status & remarks PATCH routes
│   ├── boq.js           # Existing BOQ endpoints
│   ├── auth.js          # Auth & RBAC routes
│   └── admin.js         # User & permission management
└── server.js            # Mounts /api/reports router

frontend/
├── src/
│   ├── pages/
│   │   └── Reports.jsx  # ENHANCED: Management dashboard, Recharts trend charts, status breakdown, editable remarks column, multi-filter bar
│   ├── components/
│   │   ├── CustomStatusDropdown.jsx # Normalized Closed/In Review/Rejected status selector
│   │   └── Sidebar.jsx  # Reports navigation link
│   └── utils/
│       └── rbac.js      # Role & permission checks
```

**Structure Decision**: Web application layout (`backend/` + `frontend/`) leveraging Express route modules and React component hierarchy.

## Complexity Tracking

*No constitution violations or unjustified architectural complexity.*
