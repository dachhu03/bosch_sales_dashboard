# Implementation Plan: Deployment Environment Configuration Update

**Branch**: `014-deployment-env-config` | **Date**: 2026-08-07 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/014-deployment-env-config/spec.md`

## Summary

Update the frontend and backend environment configurations to support separate cloud hosting (Vercel frontend + Render backend) alongside local development. In the frontend (`frontend/src/App.jsx` and `Ratecard.jsx`), replace hardcoded `http://localhost:5000` URLs with dynamic `import.meta.env.VITE_API_URL` environment variable resolution with local fallback. In the backend (`backend/server.js`), update CORS configuration to dynamically authorize origins defined in `process.env.FRONTEND_URL` while keeping `http://localhost:5173` allowed for local development.

## Technical Context

**Language/Version**: JavaScript (ES2022+), React 18, Node.js 18+ Express
**Primary Dependencies**: Axios (`axios`), Express (`express`), CORS (`cors`), Vite (`import.meta.env`)
**Storage**: Supabase Postgres & Local Media Static Storage (`/media`)
**Testing**: Environment URL resolution tests & cross-origin API integration checks
**Target Platform**: Frontend: Vercel (`https://bosch-sales-dashboard.vercel.app`), Backend: Render (`https://bosch-sales-dashboard.onrender.com`), Local: localhost:5173 / localhost:5000
**Project Type**: Web Application (React frontend + Express REST backend)
**Performance Goals**: Zero latency overhead for API origin resolution; instant environment detection
**Constraints**: Zero hardcoded URLs; 100% feature preservation for login, auth, product CRUD, BOQ, reports, and RBAC
**Scale/Scope**: 2 Frontend source files (`App.jsx`, `Ratecard.jsx`), 1 Backend file (`server.js`), 2 Env sample templates (`frontend/.env.example`, `backend/.env.example`)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Rule 1: Preserve Existing APIs & Auth Contracts**: Pass. Supabase auth, JWT bearer headers, REST contracts, and session validation remain unchanged.
- **Rule 2: Responsive & Multi-Environment Standards**: Pass. Dynamic environment variable resolution allows seamless environment switching.
- **Rule 3: No Unjustified Dependencies**: Pass. Uses Vite `import.meta.env` and Node `process.env` without adding heavy runtime libraries.

## Project Structure

### Documentation (this feature)

```text
specs/014-deployment-env-config/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
└── contracts/           # Phase 1 output (/speckit.plan command)
    └── env-config-contract.json
```

### Source Code (repository root)

```text
frontend/
├── src/
│   ├── App.jsx          # Dynamic Axios baseURL configuration (VITE_API_URL)
│   ├── pages/
│   │   └── Ratecard.jsx # Dynamic product image media URL helper
│   └── utils/
│       └── api.js       # Centralized API base URL & media resolver helper
├── .env.example         # Template for VITE_API_URL

backend/
├── server.js            # Dynamic CORS origin parsing (FRONTEND_URL)
└── .env.example         # Template for FRONTEND_URL, SUPABASE, JWT_SECRET
```

**Structure Decision**: Web application layout updating `frontend/src/App.jsx`, `frontend/src/pages/Ratecard.jsx`, `backend/server.js`, and `.env.example` templates.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| None | N/A | Fully aligned with standard cloud deployment practices |
