# Implementation Plan: BOQ Save Email Notification & Super Admin Review

**Branch**: `016-boq-email-notification-review` | **Date**: 2026-08-13 | **Spec**: [`spec.md`](spec.md)

**Input**: Feature specification from `/specs/016-boq-email-notification-review/spec.md`

## Summary

Implement an automated email notification and internal review workflow for BOQ quotation saves. Every successful BOQ creation or update by an authorized user (Super Admin, Pre-Sales Admin, Price Admin) triggers a background email notification via Nodemailer and Gmail SMTP to all Super Admin users, featuring event deduplication via unique `event_id` payloads. Extend `exapp_boq` table with internal review fields (`review_status`, `review_remarks`, `updated_at`) and create a `notifications` audit log table. Build a Super Admin Review & Notification Panel in the Admin dashboard allowing Super Admins to inspect notification history, review solutions, update internal review status (`PENDING_REVIEW`, `IN_REVIEW`, `APPROVED`, `REJECTED`), and record internal review remarks independently of customer quotation statuses. Enforce strict server-side RBAC validation and notification error isolation to ensure 0 save rollbacks on SMTP transport failures.

## Technical Context

**Language/Version**: JavaScript (Node.js ESM ES2022 / React 18 JSX)  

**Primary Dependencies**: Express 4, `@supabase/supabase-js` v2, `nodemailer` v6, React 18, Vite 5, React Router v6, Axios, Lucide-React, Framer Motion, Tailwind CSS v3  

**Storage**: Supabase PostgreSQL (`exapp_boq` table extensions and `notifications` audit table)  

**Testing**: E2E scenario validation via [`quickstart.md`](quickstart.md)  

**Target Platform**: Modern Web Browsers (Chrome, Edge, Firefox, Safari)  

**Project Type**: Web application (`backend/` Express server + `frontend/` React SPA)  

**Performance Goals**: Email notification trigger latency < 3s after DB commit; event deduplication check < 50ms  

**Constraints**: Zero breaking database schema DDL changes; zero rollbacks on BOQ saves due to SMTP errors; credentials stored exclusively in backend environment variables (`SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`, `EMAIL_FROM`)  

**Scale/Scope**: Automated email dispatch and internal management review across pre-sales quotations  

## Constitution Check

*GATE: Passed before Phase 0 research. Re-checked post Phase 1 design.*

- **Modular Service Architecture**: PASS - Email transport and notification dispatch encapsulated in `backend/services/emailService.js` and `backend/services/notificationService.js`.
- **Security & Credential Protection**: PASS - SMTP credentials managed strictly in backend `.env` and Render production environment variables. Never exposed to frontend or repository code.
- **RBAC & Authorization Enforcement**: PASS - Endpoint permissions guarded by `verifyToken`, `requirePermission('boq:write')`, and `requireRole('super_admin')`.
- **Zero Data Loss & Failure Isolation**: PASS - BOQ database commits execute independently of email dispatch; SMTP failures log audit status `FAILED` without rolling back BOQ saves.

## Project Structure

### Documentation (this feature)

```text
specs/016-boq-email-notification-review/
├── plan.md              # Implementation plan
├── research.md          # Phase 0 architectural research
├── data-model.md        # Phase 1 data entities and status state machine
├── quickstart.md        # End-to-end validation scenarios
└── contracts/
    └── notifications-api.md # API request/response specifications
```

### Source Code (repository root)

```text
backend/
├── services/
│   ├── emailService.js        # NEW: Nodemailer Gmail SMTP transport & email template formatting
│   └── notificationService.js  # NEW: Super Admin query, deduplication, notification audit logging
├── routes/
│   ├── boq.js                 # ENHANCED: Event ID handling & notification trigger on BOQ save
│   └── admin.js               # ENHANCED: Notification logs query & Super Admin review status PATCH route
├── utils/
│   └── supabase.js            # Supabase database client
└── server.js                  # Express server mounting routes

frontend/
├── src/
│   ├── pages/
│   │   ├── AdminManagement.jsx # ENHANCED: Super Admin Notification & BOQ Review Panel
│   │   └── BOQGenerator.jsx    # ENHANCED: Generates unique event_id on BOQ save
│   └── services/
│       └── api.js
```

**Structure Decision**: Web application layout (`backend/` + `frontend/`) leveraging Express route/service modules and React component hierarchy.

## Complexity Tracking

*No constitution violations or unjustified architectural complexity.*
