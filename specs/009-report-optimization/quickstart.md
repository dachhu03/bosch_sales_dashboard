# Quickstart & End-to-End Validation Guide: Report Optimization

## Purpose
This guide details the step-by-step verification procedures to validate that Report Optimization features (search, channel filtering, project highlights, solution metadata, click-to-populate navigation, and solution deletion) operate correctly end-to-end.

---

## Prerequisites

1. Node.js (v18+) and npm installed.
2. Backend Express API server running on `http://localhost:5000`.
3. Frontend Vite dev server running on `http://localhost:5173`.
4. Supabase DB connected with seeded `exapp_boq` records.

---

## Step 1: Start Servers

```bash
# Terminal 1: Backend API Server
cd backend
npm run dev

# Terminal 2: Frontend Vite Server
cd frontend
npm run dev
```

---

## Step 2: Validate Search & Channel Filtering

1. Open browser to `http://localhost:5173/reports`.
2. Observe the search bar at the top of the reports view.
3. **Keyword Search Test**: Type a known project name (e.g., "Mall") or quotation number. Verify that only matching BOQ cards/rows remain visible.
4. **Channel Dropdown Test**:
   - Select **"System Integrator (SI)"** from the channel filter dropdown. Verify that only BOQs with `approach: 'si'` are rendered.
   - Select **"Direct Purchase"** from the dropdown. Verify that only BOQs with `approach: 'direct'` are rendered.
   - Select **"All Channels"**. Verify all BOQs re-appear.

---

## Step 3: Validate High-Value & Most Used Solution Highlighting

1. Inspect the filtered list of solution rows/cards.
2. Verify that quotes with high sales volume ($\ge ₹10,000,000$) display an amber/gold **"High Value"** badge and highlight border.
3. Verify that quotes with high priority display an emerald/blue **"High Priority"** badge.
4. Locate the solution row with the highest usage count and verify it displays the **"Most Used Solution"** star badge.
5. Check that every solution row displays **"Prepared By: [User]"** and approval status (**"Pending"** or **"Approved"**).

---

## Step 4: Validate Click-to-Populate BOQ Generator Flow

1. Click on a solution row or click its **"Load into BOQ Generator"** action button.
2. Confirm instant route transition to `/boq`.
3. Verify that the BOQ Generator automatically loads the selected solution:
   - Project Name, Location, Quotation Number match the selected report.
   - Hardware, Software, and Service tables auto-populate with exact catalog items, quantities, specifications, and prices.
   - AMC and Grand Totals update immediately without manual input.

---

## Step 5: Validate Solution Row Deletion

1. Return to `http://localhost:5173/reports`.
2. Locate a test solution row and click the **Delete** icon.
3. Confirm that a modal dialog appears stating *"Are you sure you want to delete solution '[Title]'?"*.
4. Click **Cancel** $\rightarrow$ Verify the solution is NOT deleted.
5. Click **Delete** again and click **Confirm Delete** $\rightarrow$ Verify:
   - Success toast / notification appears.
   - Solution row is removed from the table view.
   - Summary aggregate totals update instantly.
