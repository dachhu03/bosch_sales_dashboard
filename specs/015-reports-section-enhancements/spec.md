# Feature Specification: Reports Section Optimization and Feature Enhancement

**Feature Branch**: `015-reports-section-enhancements`

**Created**: 2026-08-13

**Status**: Draft

**Input**: User description: "The Reports section will be upgraded from a basic quotation list into a complete management reporting dashboard. The main improvements are monthly and yearly sales/margin analysis, status tracking for Closed/In Review/Rejected quotations, editable remarks for rejection or improvement feedback, filtering and search options, and optimized backend APIs to reduce unnecessary database requests and improve performance. I’ll also ensure RBAC protection and validation so only authorized users can update status and remarks, while keeping all existing features unaffected."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Quotation Performance & Management Dashboard Overview (Priority: P1)

As a management user or sales executive, I want to upgrade the Reports section from a basic quotation list into a complete management reporting dashboard featuring summary KPI cards, status distribution metrics, and interactive monthly/yearly sales & profit margin charts so that I can quickly analyze business performance and conversion metrics.

**Why this priority**: Management requires high-level visibility into total quoted sales volume, profit margins, and quotation pipeline distribution (`Closed`, `In Review`, `Rejected`) to make strategic business decisions.

**Independent Test**: Can be tested by navigating to the Reports section with existing quotation data, selecting custom year/month date ranges, and verifying that total quoted sales value, overall profit margin percentage, and quotation status counts accurately reflect the dataset.

**Acceptance Scenarios**:

1. **Given** a list of quotations with varying values, profit margins, and statuses in the system, **When** an authorized user opens the Reports dashboard, **Then** the summary cards display total quoted sales amount, average profit margin percentage, total quotation count, and breakdown counts for Closed, In Review, and Rejected statuses.
2. **Given** the Reports dashboard, **When** a user selects a specific year or month filter, **Then** all summary metrics, monthly/yearly trend charts, and quotation tables update dynamically to reflect only quotations created or updated within that selected period.
3. **Given** a user viewing status breakdown charts, **When** hovering or clicking on a status category (Closed, In Review, Rejected), **Then** detailed breakdown metrics and percentage distributions are visually presented.

---

### User Story 2 - Quotation Table with Status Tracking & Editable Remarks (Priority: P2)

As a sales manager or supervisor, I want to review individual quotations in a detailed tabular layout with explicit status indicators (`Closed`, `In Review`, `Rejected`) and an editable notes/remarks column so that authorized users can attach rejection reasons, improvement feedback, or follow-up remarks to any quotation.

**Why this priority**: Operational management requires granular tracking at the individual quotation level to document why deals were lost, capture feedback for quotation improvements, and record necessary follow-ups.

**Independent Test**: Can be tested by an authorized user updating a quotation's status to "Closed", "In Review", or "Rejected", adding a custom remark into the notes field, saving, refreshing the page, and confirming that the status and remark persist correctly while unauthorized users are restricted from editing.

**Acceptance Scenarios**:

1. **Given** the quotation breakdown table in the Reports section, **When** a user views a quotation row, **Then** the row displays key identifiers, customer name, total quoted value, profit margin percentage, current status badge (Closed, In Review, or Rejected), and notes/remarks content.
2. **Given** an authorized user reviewing a quotation with "In Review" or "Rejected" status, **When** the user enters a follow-up remark or rejection/improvement feedback into the notes column/editor and saves, **Then** the note is validated, persisted, and timestamped for future reference.
3. **Given** a read-only or unauthorized user viewing the table, **When** hovering over status or remarks fields, **Then** edit controls are disabled or hidden according to RBAC permissions.
4. **Given** an authorized user updating a quotation status from "In Review" to "Closed" or "Rejected", **When** the status change is saved, **Then** the dashboard summary counts and charts automatically refresh to reflect the new status distribution.

---

### User Story 3 - High-Performance Aggregated Reporting & Filtering (Priority: P3)

As a sales analyst or manager, I want the Reports section to load rapidly (<1.5s) and respond instantly (<300ms) when applying multiple filters (date, status, channel, keyword) without triggering redundant database or network requests.

**Why this priority**: A sluggish reporting dashboard degrades user experience and consumes unnecessary database resources during management review sessions.

**Independent Test**: Can be tested by loading a dataset with hundreds of quotations and measuring page initial load speed and filter toggle response times, ensuring zero redundant data fetches occur when switching between pre-cached or client-side filter states.

**Acceptance Scenarios**:

1. **Given** a user accessing the Reports section, **When** the page loads, **Then** initial rendering of summary metrics and charts completes in under 1.5 seconds with optimized payload size via database column projections.
2. **Given** an active Reports session with loaded data, **When** the user changes filter criteria (e.g., status filter, date range, or keyword search), **Then** data filtering and chart updates respond in under 300 milliseconds without making full re-fetch API calls for cached dataset ranges.

---

### Edge Cases

- **Zero Data Period**: What happens when a user selects a month or year filter that has zero quotations created? (System MUST display clean empty-state indicators across charts and summary cards with zeroed metrics rather than failing or showing calculation errors like `NaN%` or `null`).
- **Negative Margin Quotations**: How does the system display quotations with zero or negative profit margins due to cost overruns? (System MUST highlight low/negative margin quotations in distinct visual alert colors and incorporate them accurately into overall margin calculations).
- **Long Notes/Remarks Content**: How does the table render quotations with multi-line or extensive review notes? (System MUST display truncated text with an expandable tooltip or modal editor to preserve clean table alignment).
- **Unauthorized Edit Attempt**: What happens if an unauthorized user attempts to trigger status or remarks update endpoints? (System MUST return a 403 Forbidden error response and preserve database state without mutation).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST upgrade the Reports section into a complete management reporting dashboard featuring summary KPI cards for Total Quoted Revenue, Total Profit Margin ($ and %), Total Quotations Count, and Status Distribution.
- **FR-002**: System MUST render monthly and yearly trend charts comparing quoted sales volume against profit margin trends across selected time horizons.
- **FR-003**: System MUST support a Quotation Status classification system consisting of exactly three primary operational statuses:
  - **Closed**: Quotation has been approved or successfully completed.
  - **In Review**: Quotation is under evaluation or awaiting customer confirmation.
  - **Rejected**: Quotation has been rejected or not approved.
- **FR-004**: System MUST provide an editable notes/remarks column for each quotation entry allowing authorized users to input, edit, and save remarks (e.g., rejection reasons, improvement feedback, follow-up notes).
- **FR-005**: System MUST provide multi-criteria filtering capabilities allowing users to slice report data by Year, Month, Quotation Status, Sales Channel (SI vs Direct), and Search keyword.
- **FR-006**: System MUST optimize data-fetching and calculation architecture by using database query column projections (`id`, `project_name`, `project_location`, `quotation_number`, `approach`, `solution_title`, `totals`, `created_at`) to eliminate redundant database/API requests on filter changes.
- **FR-007**: System MUST enforce strict RBAC protection and server-side validation so only authorized users (e.g., users with `boq:write` or `super_admin` role) can update quotation status and remarks, while read-only users are prevented from making edits.
- **FR-008**: System MUST strictly isolate all Reports section changes so that existing authentication, RBAC, BOQ calculations, product management catalog, and quotation creation workflows remain 100% functional and unmodified.

### Key Entities *(include if feature involves data)*

- **Quotation Report Summary**: Represents aggregated performance metrics for a selected time period (Total Quoted Revenue, Overall Profit Margin %, Count by Status).
- **Quotation Performance Entry**: Extends quotation metadata for reporting, containing quotation ID, customer name, date created/updated, total sales value, total profit margin, profit margin percentage, current status (`Closed`, `In Review`, `Rejected`), and associated follow-up notes/remarks.
- **Quotation Note/Remark**: Represents text annotations tied to a specific quotation detailing review feedback, rejection reasons, or follow-up notes.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Initial load time of the Reports dashboard completes in under 1.5 seconds on standard network connections.
- **SC-002**: Changing filter selections (status, date range, customer, keyword) updates the charts and table in under 300 milliseconds.
- **SC-003**: 100% of quotations in the reporting table accurately display their assigned status (`Closed`, `In Review`, `Rejected`) and persisted remarks.
- **SC-004**: 100% of status and remarks mutation endpoints are guarded by RBAC validation, rejecting unauthorized edit attempts with HTTP 403.
- **SC-005**: 0 regression errors introduced into existing authentication, RBAC, BOQ, product management, or core application modules.

## Assumptions

- Existing quotation data structures contain or can be safely extended to persist status (`Closed`, `In Review`, `Rejected`) and text notes in `totals.remarks` without breaking existing BOQ schemas.
- Management and sales users accessing the Reports section have appropriate read/write permissions governed by existing RBAC policies (`reports:read` for viewing, `boq:write` / `super_admin` for editing).
- Profit margin percentages are calculated based on total sales value versus total product/solution cost.
