# Phase 0 Research: Reports Section Optimization and Feature Enhancement

## Architectural & Technical Decisions

### 1. Data-Fetching & Performance Optimization
- **Decision**: Create a dedicated `/api/reports/summary` backend endpoint that queries Supabase table `exapp_boq` selecting only essential summary columns (`id`, `project_name`, `project_location`, `quotation_number`, `approach`, `solution_title`, `totals`, `created_at`), explicitly excluding heavy line-item JSON columns (`hardware`, `software`, `services`, `amc`).
- **Rationale**: The existing `/api/boq/list` endpoint retrieves complete hardware, software, and service line-item arrays for all quotations. For reporting dashboards, line-item details are unnecessary and cause heavy network payloads. Proportional data fetching reduces payload size by over 80%, enabling initial page load in under 1.5 seconds.
- **Alternatives Considered**: 
  - *Client-side filtering over `/api/boq/list`*: Rejected because fetching entire line-item trees for historical quotes degrades network performance.
  - *SQL Database Views*: Rejected because Supabase client projection `select('id, project_name, project_location, quotation_number, approach, solution_title, totals, created_at')` provides identical performance without adding extra DB schema management complexity.

### 2. Quotation Status Normalization
- **Decision**: Normalize quotation status handling in the Reports section around three primary operational statuses: `Closed`, `In Review`, and `Rejected`. Legacy status values are mapped dynamically (`Approved` $\rightarrow$ `Closed`, `Pending` $\rightarrow$ `In Review`).
- **Rationale**: Matches the required status taxonomy (`Closed`, `In Review`, `Rejected`) while preserving full backward compatibility for existing records in the database.
- **Alternatives Considered**: Direct SQL data migration updating legacy strings. Deferred to preserve compatibility with existing BOQ generator components that reference legacy strings.

### 3. Quotation Remarks / Notes Persistence
- **Decision**: Store follow-up remarks inside the `totals.remarks` field within the `totals` JSONB column of `exapp_boq`. Provide a `PATCH /api/reports/:id/remarks` (or `PATCH /api/boq/:id/remarks`) endpoint for instant note updates.
- **Rationale**: Storing remarks inside `totals` eliminates the need for schema DDL migrations on `exapp_boq` while making remarks immediately available across both BOQ generation and Reports endpoints.
- **Alternatives Considered**: Separate relational table for remarks. Rejected as over-engineering for simple quotation review notes.

### 4. Visualizations & Client-Side Filtering
- **Decision**: Use `recharts` (ComposedChart, ResponsiveContainer, Bar, Line, PieChart, Pie, Cell, Tooltip) for rendering monthly/yearly sales & profit margin trends and status distribution charts. Implement client-side filtering via React `useMemo`.
- **Rationale**: `recharts` is already installed in `frontend/package.json`. Client-side memoized filtering of the streamlined summary dataset enables filter changes (by Year, Month, Status, Channel, Keyword) to execute in under 50ms without redundant backend network calls.
