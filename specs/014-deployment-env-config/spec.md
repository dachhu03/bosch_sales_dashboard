# Feature Specification: Deployment Environment Configuration Update

**Feature Branch**: `014-deployment-env-config`

**Created**: 2026-08-07

**Status**: Draft

**Input**: User description: "Update application deployment configuration to support separate frontend (Vercel) and backend (Render) hosting via dynamic environment variable resolution and CORS configuration, preserving 100% feature parity and local development capability without hardcoded API endpoints or breaking authentication."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Environment-Aware Frontend API Resolution (Priority: P1)

As a system developer or DevOps engineer, I want the frontend application to automatically resolve its backend API target based on active environment configuration, so that production deployments automatically connect to the cloud backend while local development seamlessly targets localhost.

**Why this priority**: Hardcoded backend URLs prevent independent cloud deployment and risk exposing local endpoints or failing cross-origin requests in production.

**Independent Test**: Can be tested independently by toggling environment configuration (`VITE_API_URL`) between local (`http://localhost:5000/api`) and production (`https://bosch-sales-dashboard.onrender.com/api`) and observing that all network requests automatically target the configured origin without code changes.

**Acceptance Scenarios**:

1. **Given** a local development environment running `npm run dev`, **When** the frontend issues API calls (login, BOQ generation, product management), **Then** all requests target `http://localhost:5000/api`.
2. **Given** a production deployment hosted on Vercel with `VITE_API_URL` set, **When** a user accesses the application, **Then** all API requests target `https://bosch-sales-dashboard.onrender.com/api`.
3. **Given** any frontend component or utility module, **When** inspecting API call definitions, **Then** zero hardcoded backend URL strings exist anywhere in the codebase.

---

### User Story 2 - Dynamic & Secure Cross-Origin (CORS) backend Handling (Priority: P1)

As an API consumer or web client, I want the backend service to validate and permit incoming requests from both local development clients and configured production frontend origins, so that cross-origin requests succeed without CORS pre-flight blockages.

**Why this priority**: Separate frontend (Vercel) and backend (Render) domains require proper CORS header configuration to allow credentials, custom headers, and API methods.

**Independent Test**: Can be tested independently by sending HTTP requests with `Origin: http://localhost:5173` and `Origin: https://bosch-sales-dashboard.vercel.app` to the backend and verifying `Access-Control-Allow-Origin` and `Access-Control-Allow-Credentials` headers match the requesting origin.

**Acceptance Scenarios**:

1. **Given** a request originating from `http://localhost:5173`, **When** sent to the backend, **Then** the server responds with valid CORS headers allowing the local origin.
2. **Given** a request originating from the configured production frontend URL (`FRONTEND_URL`), **When** sent to the backend, **Then** the server responds with valid CORS headers allowing the production origin.
3. **Given** an unauthorized third-party origin, **When** sending cross-origin requests, **Then** the backend rejects or restricts access according to security guidelines.

---

### User Story 3 - Unbroken Authentication & Full Feature Preservation (Priority: P1)

As an authenticated CRM user or administrator, I want all existing features (Login, Logout, Session Validation, Product CRUD, BOQ Generator, Reports, File Upload, and RBAC) to work identically across both local and production environments, so that deployment changes introduce zero visual or functional regressions.

**Why this priority**: Environmental updates must not impair core business functions, Supabase authentication tokens, JWT validation, or database access.

**Independent Test**: Can be tested independently by executing full end-to-end workflows (login, role checks, product CRUD, BOQ export, report filtering) in both local and production preview environments.

**Acceptance Scenarios**:

1. **Given** an existing valid session, **When** navigating between CRM routes (Dashboard, BOQ, Reports, Admin), **Then** JWT bearer tokens are attached correctly to all dynamic API requests.
2. **Given** file upload or multipart form operations, **When** submitted to the API, **Then** headers, pre-flight checks, and payload streams execute seamlessly.

---

### Edge Cases

- **Missing Environment Variable Fallback**: How does the frontend handle missing `VITE_API_URL` during local dev? (System MUST fall back gracefully to `http://localhost:5000/api` or `/api`).
- **Trailing Slash Normalization**: How does the API client handle `VITE_API_URL` configured with or without a trailing slash (e.g. `.../api` vs `.../api/`)? (System MUST sanitize and normalize base URLs to prevent double slashes like `//products`).
- **Multiple Allowed Origins**: How does the backend CORS policy handle comma-separated or array-based frontend origins for staging/preview deployments? (System MUST parse origin lists dynamically).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST configure the frontend HTTP client (Axios/Fetch) using environment variable `VITE_API_URL` as the central base URL for all API calls.
- **FR-002**: System MUST remove all hardcoded backend URLs (such as `http://localhost:5000/api`) from all frontend components, pages, and utility services.
- **FR-003**: System MUST configure the backend CORS middleware to dynamically authorize requests from `http://localhost:5173` and the origin defined in `FRONTEND_URL`.
- **FR-004**: System MUST maintain full support for Supabase authentication, JWT authorization headers, session validation, and Role-Based Access Control (RBAC).
- **FR-005**: System MUST ensure environment variable defaults enable local development out-of-the-box without manual code modifications when switching environments.
- **FR-006**: System MUST normalize all dynamic API URL path joins to prevent malformed endpoint strings.
- **FR-007**: System MUST preserve all existing API contract signatures, request payloads, and file upload endpoints across local and production deployments.

### Key Entities

- **Environment Config Entity**: Represents active application mode (`development` vs `production`), frontend API target (`VITE_API_URL`), and allowed origins (`FRONTEND_URL`).
- **API Request Context**: Represents HTTP request configuration including dynamic base URL, authorization headers (`Bearer <token>`), and content types.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of frontend API calls use the dynamic `VITE_API_URL` base configuration with 0 hardcoded backend URL occurrences remaining.
- **SC-002**: 0 CORS errors encountered during local development (`http://localhost:5173`) and production hosting (`https://bosch-sales-dashboard.vercel.app`).
- **SC-003**: 100% pass rate across end-to-end regression checks (Login, Product CRUD, BOQ Generation, Reports, File Upload, Admin RBAC).
- **SC-004**: Switching from local dev to production preview requires 0 code alterations, relying entirely on environment variables.

## Assumptions

- Production frontend is hosted on Vercel (`https://bosch-sales-dashboard.vercel.app`).
- Production backend is hosted on Render (`https://bosch-sales-dashboard.onrender.com/api`).
- Environment variables (`SUPABASE_URL`, `SUPABASE_ANON_KEY`, `JWT_SECRET`, `NODE_ENV`, `FRONTEND_URL`, `VITE_API_URL`) are configured in respective platform dashboards (Vercel & Render).
