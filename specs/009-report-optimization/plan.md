# Implementation Plan: Report Optimization & Solution Management

**Branch**: `009-report-optimization` | **Date**: 2026-08-02 | **Spec**: [`spec.md`](file:///D:/newUser/Pre-sales-CRM/bosch_sales_dashboard/specs/009-report-optimization/spec.md)

**Input**: Feature specification from [`/specs/009-report-optimization/spec.md`](file:///D:/newUser/Pre-sales-CRM/bosch_sales_dashboard/specs/009-report-optimization/spec.md)

## Summary

The Report Optimization feature upgrades the Pre-sales CRM reporting interface (`Reports.jsx`) and backend service (`backend/routes/boq.js`). It adds real-time keyword search across BOQs, purchase channel dropdown filtering ("System Integrator (SI)" vs. "Direct Purchase"), dynamic visual highlighting for high-value and high-priority projects, solution authorship ("Prepared By") and approval status ("Pending" / "Approved"), a "Most Used Solution" badge, interactive click-to-populate navigation to `BOQGenerator.jsx`, and a 2-step solution deletion modal.

## Technical Context

**Language/Version**: JavaScript (ES6+ / Node.js 18+), React 18

**Primary Dependencies**: React, React Router DOM v6, Axios, Framer Motion, Lucide React icons, Tailwind CSS v3, Express v4, Supabase JS Client v2

**Storage**: PostgreSQL via Supabase (`exapp_boq` table)

**Testing**: E2E Quickstart validation, UI contract verification

**Target Platform**: Modern Web Browsers (Chrome, Edge, Firefox, Safari)

**Project Type**: Full-stack Web Application (Express backend + React frontend)

**Performance Goals**: Keyword search & dropdown filtering update UI in $< 150\text{ ms}$; click-to-populate auto-fills BOQ Generator in $< 300\text{ ms}$

**Constraints**: Clean Tailwind design system compliance, zero layout breaking changes, non-blocking state updates

**Scale/Scope**: Pre-sales CRM reporting & solution management module

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Passes Library & CLI Rules**: System follows modular component and REST API contract patterns.
- **Passes Testability & Contract Principles**: API routes strictly defined; validation workflows documented in `quickstart.md`.
- **Passes Simplicity & Observability**: Reuses existing `exapp_boq` table and React Router state navigation; clear status reporting.

## Project Structure

### Documentation (this feature)

```text
specs/009-report-optimization/
├── plan.md              # Implementation plan (this file)
├── research.md          # Phase 0 architectural decisions & mappings
├── data-model.md        # Phase 1 entity schemas & state models
├── quickstart.md        # Phase 1 E2E validation & testing guide
└── contracts/
    └── report-optimization-api.md # API contract specification
```

### Source Code (repository root)

```text
backend/
├── routes/
│   └── boq.js           # Enhanced GET /list, GET /:id, DELETE /:id, POST /:id/increment-usage
└── utils/
    └── supabase.js      # Supabase client connector

frontend/
├── src/
│   ├── pages/
│   │   ├── Reports.jsx       # Real-time search, channel dropdown, project cards/rows, highlights & delete modal
│   │   └── BOQGenerator.jsx  # Auto-population handler receiving navigation state
│   ├── components/
│   │   └── Sidebar.jsx       # Navigation sidebar
│   └── App.jsx               # React Router layout & auth context
```

**Structure Decision**: Standard web application structure with separate `backend` (Express) and `frontend` (Vite + React) directories.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| *None* | N/A | Design uses existing stack without added dependencies or architectural complexity. |
