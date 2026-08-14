# Quickstart & End-to-End Validation Guide

**Feature**: Reports Section Optimization and Feature Enhancement  
**Branch**: `015-reports-section-enhancements`  
**Reference Contracts**: [`contracts/reports-api.md`](contracts/reports-api.md) | **Data Model**: [`data-model.md`](data-model.md)

---

## Prerequisites & Environment Setup

1. Node.js (v18+) and npm installed.
2. Local backend server and frontend development server active:
   - Backend: `npm run dev` inside `backend/` (running on `http://localhost:5000`)
   - Frontend: `npm run dev` inside `frontend/` (running on `http://localhost:5173`)
3. Database initialized with Supabase environment variables configured in `backend/.env`.

---

## End-to-End Test Scenarios

### Scenario 1: Initial Reports Dashboard Loading & Summary Verification
1. Open browser to `http://localhost:5173/reports`.
2. Login with standard credentials or Admin account.
3. Verify page renders:
   - Summary cards displaying Total Active Quotes, Combined Quoted Sales (₹), Est. Profit Margins (₹), and Status Counts (`Closed`, `In Review`, `Rejected`).
   - Monthly and yearly trend charts for quoted sales & profit margins.
   - Quotation Log table with Project Details, Solution Title, Quotation No, Prepared By, Channel, Status badge, Sales/Margin amount, and Notes column.
4. **Validation Outcome**: Initial load time is under 1.5 seconds and metrics reflect the database state cleanly without rendering errors or `NaN%`.

---

### Scenario 2: Multi-Criteria Filtering & Performance
1. On the Reports page, select a Year filter (e.g., `2026` or `2025`) or Month filter.
2. Toggle Status Filter between `All`, `Closed`, `In Review`, and `Rejected`.
3. Type a keyword into the Search bar (e.g., `BLR` or project name).
4. **Validation Outcome**: Charts, KPI cards, and quotation table update in under 300 milliseconds. Network tab confirms no repetitive full-table re-fetch requests occur for local filter actions.

---

### Scenario 3: Remarks / Notes Editing and Persistence
1. Locate a quotation row with `In Review` or `Rejected` status.
2. Click the Notes/Remarks cell or edit button.
3. Enter custom feedback (e.g., `"Revised scope requested by client on 13-Aug"`).
4. Save the remark and refresh the page.
5. **Validation Outcome**: The updated note is persisted in the database and displayed in the table row upon page refresh.

---

### Scenario 4: Status Transition & Dynamic Metric Update
1. Update a quotation status from `In Review` to `Closed` using the status badge dropdown.
2. Observe the Toast notification `"Status updated to Closed"`.
3. Check the Status Distribution summary cards and charts.
4. **Validation Outcome**: Closed count increments by 1, In Review count decrements by 1, and total Closed Sales volume reflects the update instantly.

---

### Scenario 5: Regression & Isolation Validation
1. Navigate to BOQ Generator (`/boq`). Verify BOQ creation, calculation, and editing functions normally.
2. Navigate to Rate Card / Product Catalog (`/products`). Verify product search and updates operate without issues.
3. Navigate to Admin / User Management (`/admin`). Verify RBAC permissions and user role management remain fully operational.
4. **Validation Outcome**: Zero regression errors across existing modules.
