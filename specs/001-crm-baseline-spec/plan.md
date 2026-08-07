# Implementation Plan: Bosch Sales CRM Baseline Architecture

**Branch**: `001-crm-baseline-spec` | **Date**: 2026-07-31 | **Spec**: [spec.md](file:///D:/newUser/Pre-sales-CRM/bosch_sales_dashboard/specs/001-crm-baseline-spec/spec.md)

**Input**: Feature specification from `specs/001-crm-baseline-spec/spec.md`

## Summary

This implementation plan establishes the architectural baseline for the operational **Bosch Sales CRM** system. The application utilizes a decoupled full-stack architecture featuring a React frontend (with Recharts, Framer Motion, Axios) and a Node.js/Express backend powered by Prisma ORM, PostgreSQL database (`supabase_schema.sql`), Supabase storage, JWT authentication, and ExcelJS report generation.

---

## Technical Context

**Language/Version**: Node.js (ES6+/CommonJS), React 18+ (JavaScript)  
**Primary Dependencies**: Express.js, Prisma ORM, Supabase JS, JWT, Multer, ExcelJS, React Router, Axios, Framer Motion, Recharts, Lucide React  
**Storage**: PostgreSQL (Prisma ORM data access), Supabase Storage (image/document storage)  
**Testing**: Jest, Supertest (backend API testing), React Testing Library / Vitest (frontend testing)  
**Target Platform**: Node.js server environment; modern desktop browsers (Chrome, Edge, Firefox, Safari)  
**Project Type**: Full-stack Web Application (`frontend` + `backend`)  
**Performance Goals**: Central dashboard render < 1.5s, API endpoint latency < 300ms average, 200+ concurrent user support  
**Constraints**: Preserve existing technology stack, zero disruption to active business workflows, preserve existing database schemas  
**Scale/Scope**: Enterprise pre-sales CRM (Customer Management, Total Solutions Catalog, BOQs, Sales Pipeline, Analytics, Administration)  

---

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Principle I: Modular Architecture**: PASS — Clear decoupling between `frontend` React UI and `backend` REST APIs.
- **Principle II: REST Protocol**: PASS — Standard HTTP JSON endpoints with JWT header authentication.
- **Principle III: Testability**: PASS — Independent controller methods and reusable UI components.
- **Principle IV: Integration & Data Integrity**: PASS — Prisma ORM models strictly map to PostgreSQL tables with FK/UK constraints.
- **Principle V: Observability & Security**: PASS — Centralized error handling middleware, JWT verification, and structured server logs.

---

## Project Structure

### Documentation (this feature)

```text
specs/001-crm-baseline-spec/
├── plan.md              # This file (implementation plan)
├── research.md          # Phase 0 output (architectural decisions & technical stack analysis)
├── data-model.md        # Phase 1 output (Prisma schemas, relational models, state transitions)
├── quickstart.md        # Phase 1 output (developer environment setup & verification guide)
└── contracts/           # Phase 1 output (REST API interface contracts)
    └── api-contracts.md # Endpoints, HTTP methods, request/response schemas
```

### Source Code (repository root)

```text
backend/
├── src/
│   ├── config/          # DB, Supabase, JWT configurations
│   ├── controllers/     # Auth, Customer, Product, Sales, Report, Admin controllers
│   ├── middleware/      # Auth JWT verification, role check, Multer file handler
│   ├── routes/          # Express route definitions
│   ├── services/        # Business logic, calculation engine, ExcelJS streaming
│   └── utils/           # Helper functions & response formatters
├── prisma/
│   └── schema.prisma    # Prisma schema definitions
└── tests/

frontend/
├── src/
│   ├── assets/          # Static images & icons
│   ├── components/      # Reusable UI components (Tables, Cards, Modals, Navbar, Sidebar)
│   ├── context/         # AuthContext & global UI state
│   ├── pages/           # Dashboard, Customers, Products, Sales, Reports, Admin pages
│   ├── services/        # Axios API client modules
│   └── utils/           # Formatters, margin calculators, validation helpers
└── public/
```

**Structure Decision**: Decoupled full-stack structure with dedicated `backend/` and `frontend/` directories maintaining clear separation of concerns.

---

## Complexity Tracking

> *No constitution violations detected; baseline design maintains simplicity and direct alignment with existing code.*
