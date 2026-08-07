# Research & Architectural Decisions: Report Optimization & Solution Management

## Overview

This research artifact documents the technical decisions, data mappings, and UI patterns for implementing report search, channel filtering, project highlights, solution metadata, auto-population navigation, and solution deletion.

## 1. Purchase Channel Data Mapping

### Decision
Map the purchase channel filter options directly to the existing `approach` field in the `exapp_boq` table:
- **"System Integrator (SI)"** $\rightarrow$ `approach: 'si'`
- **"Direct Purchase"** $\rightarrow$ `approach: 'direct'`
- **"All Channels"** $\rightarrow$ Matches all records regardless of `approach`.

### Rationale
The `exapp_boq` schema already captures `approach` during BOQ quote saving. Normalizing the dropdown selection to filter by `'si'` vs `'direct'` leverages existing backend data with zero schema breaking changes.

### Alternatives Considered
- *Creating a separate channel lookup table*: Rejected as unnecessarily complex for a 2-way categorical filter.

---

## 2. High-Value & High-Priority Project Identification

### Decision
Calculate high-value projects dynamically based on the 80th percentile threshold of `grandTotalSales` in the current dataset, or quotes exceeding $\ge ₹10,000,000$ (1 Crore). Add visual badges (e.g. Amber/Gold badge for "High Value", Emerald badge for "High Priority").

### Rationale
Dynamic thresholding ensures that top-tier projects are visually prominent regardless of database size, giving pre-sales executives instant visibility into high-volume deals.

---

## 3. Solution Metadata & Approval Status Architecture

### Decision
Extend the BOQ response object to include:
- `preparedBy`: Derived from authenticated session user (`user.username`) or saved quote metadata.
- `approvalStatus`: `'Pending'` (default) or `'Approved'`.
- `usageCount`: Numeric counter tracking how many times a quote/solution has been loaded or cloned.
- `isMostUsed`: Boolean flag computed on the frontend for the entry with the highest `usageCount`.

### Rationale
Provides pre-sales management with governance oversight and highlights top-performing, reusable solution architectures across the organization.

---

## 4. Click-to-Populate Navigation Protocol

### Decision
Utilize React Router's `navigate('/boq', { state: { loadBoqId: boq.id } })` to navigate from `Reports.jsx` to `BOQGenerator.jsx`. Upon mounting or receiving navigation state in `BOQGenerator.jsx`, automatically trigger `loadBoqById(loadBoqId)` to pre-populate hardware, software, services, AMC, and project fields.

### Rationale
Passing navigation state through React Router enables instant UI transitions without forcing full-page reloads or exposing complex URL parameter structures.

---

## 5. Solution Deletion Endpoint & Confirmation Pattern

### Decision
Implement `DELETE /api/boq/:id` in `backend/routes/boq.js` with authentication validation. On the frontend, clicking the Delete icon opens a modal dialog requesting confirmation ("Are you sure you want to delete solution '[Title]'?").

### Rationale
Guarantees database integrity and prevents catastrophic data loss caused by accidental clicks.
