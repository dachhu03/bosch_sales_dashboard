# Feature Specification: Total Solution Table Optimization & Global Discount

**Feature Branch**: `007-total-solution-table-optimization`

**Created**: 2026-08-01

**Status**: Draft

**Input**: User description: "Optimize total solution table: Buy price color indicators (<=30 days green, <=60 days yellow, >60 days red). Apply discount to all discount columns with perfect pricing calculations. Replace native browser confirm popup for single item delete with a custom confirmation modal. Optimize edit and delete actions for smooth UX."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Buying Price Color Age Formatting (Priority: P1)

As a sales engineer inspecting product buy prices, I want clear color badges showing the age of the buy price quote (Green $\le$ 30 days, Yellow $\le$ 60 days, Red $>$ 60 days / missing), so I can spot stale vendor quotes instantly.

**Why this priority**: Quote age indicates pricing validity and vendor risk during pre-sales estimations.

**Independent Test**: View products with different `buyingPriceUpdatedAt` dates and verify that items updated $\le 30$ days show green, $\le 60$ days show yellow, and $> 60$ days or empty show red.

**Acceptance Scenarios**:

1. **Given** a product buy price updated within 30 days, **When** rendered in the ratecard table, **Then** display a green badge (`bg-emerald-500/10 text-emerald-600`).
2. **Given** a product buy price updated between 31 and 60 days ago, **When** rendered in the ratecard table, **Then** display a yellow badge (`bg-amber-500/10 text-amber-600`).
3. **Given** a product buy price updated more than 60 days ago or null, **When** rendered in the ratecard table, **Then** display a red badge (`bg-rose-500/10 text-rose-600`).

---

### User Story 2 - Global Bulk Discount Application (Priority: P2)

As a sales manager adjusting pricing proposals, I want to enter a discount percentage once and apply it across all product discount columns, with automated and accurate recalculated sales prices and margins.

**Why this priority**: Saves manual editing effort when negotiating portfolio-wide discount rates.

**Independent Test**: Enter a discount percentage (e.g., `15%`) in the global discount applicator and click "Apply to All". Verify that all product rows update their discount to 15%, with recalculated `salesPrice` and `salesMargin`.

**Acceptance Scenarios**:

1. **Given** a user specifying a bulk discount percentage (e.g. 15%), **When** they click "Apply to All Products", **Then** backend updates all product records in `exapp_totalsolutions` with discount = 15%.
2. **Given** updated discounts, **When** pricing calculations execute, **Then** `salesPrice` is computed as `Math.max(listPrice - (listPrice * discount / 100), 0)` and `salesMargin` is computed as `Math.round(((salesPrice - buyingPrice) / salesPrice) * 100)`.
3. **Given** bulk discount completion, **When** frontend state updates, **Then** all grid rows reflect the new discount, sales price, and sales margin cleanly.

---

### User Story 3 - Custom Delete Confirmation Modal (Priority: P3)

As a user deleting a catalog item, I want a custom, modern confirmation modal instead of a native browser popup, with smooth loading indicators and lock protection.

**Why this priority**: Native browser `window.confirm` popups look unstyled and disrupt app flow. A custom modal provides a unified, modern user experience.

**Independent Test**: Click the delete icon on a product row and verify that a custom styled modal appears. Confirming deletion executes smoothly with an inline spinner.

**Acceptance Scenarios**:

1. **Given** a user clicking the trash icon on a product row, **When** action triggers, **Then** render a custom styled Delete Confirmation Modal displaying the product title.
2. **Given** confirmation modal open, **When** user clicks "Delete Product", **Then** lock buttons, show an inline loading spinner (`Deleting...`), remove item from DB/state, and display toast notification.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST compute buy price color as `'green'` for $\le 30$ days, `'yellow'` for $31\text{--}60$ days, and `'red'` for $> 60$ days or missing `buying_price_updated_at`.
- **FR-002**: Backend MUST provide endpoint `POST /api/products/apply-global-discount` to update discount across all products and recalculate `sales_price` & `sales_margin`.
- **FR-003**: Frontend MUST provide a bulk discount control panel in the Ratecard header/filter bar allowing users to enter a percentage and apply it to all rows.
- **FR-004**: Frontend MUST replace native `window.confirm` for single item deletion with a custom React modal component.
- **FR-005**: All pricing calculations MUST be mathematically exact:
  - $\text{Sales Price} = \max(\text{List Price} - (\text{List Price} \times \frac{\text{Discount}}{100}), 0.0)$
  - $\text{Sales Margin} = \text{Sales Price} > 0 ? \text{Math.round}\left(\frac{\text{Sales Price} - \text{Buying Price}}{\text{Sales Price}} \times 100\right) : 0$

### Key Entities

- **Bulk Discount Payload**: `{ discount: number, category?: string }`.
- **Delete Item Context**: `{ id: number, productName: string }`.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% accurate buy price color indicators ($\le 30$ days green, $\le 60$ days yellow, $> 60$ days red).
- **SC-002**: Bulk discount application updates all catalog rows in $< 1$ second.
- **SC-003**: 0 native `window.confirm` popups used in single item deletion.

## Assumptions

- Pricing values operate in Indian Rupees (₹) with 2 decimal precision.
- Margin percentages are rounded integers.
