# Feature Specification: BOQ Generator Optimization & Specification Viewer

**Feature Branch**: `008-boq-optimization`

**Created**: 2026-08-01

**Status**: Draft

**Input**: User description: "Optimize BOQ Generator: Replace native saved BOQ dropdown with a custom searchable dropdown component with fast loading. Add Specification column to Hardware, Software, and Service lists with a popup modal to view full specification details and make/model details. Polish UI layout, search autocomplete, and calculations for best user experience."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Custom Saved BOQs Dropdown & Fast Quote Loading (Priority: P1)

As a sales engineer managing quotations, I want a custom, searchable dropdown to select and load saved BOQs quickly, so I can switch between quotes smoothly without slow page hangs or plain browser dropdowns.

**Why this priority**: Enhances quote selection UX and provides instant visual feedback with project details.

**Independent Test**: Click "Load Quote" dropdown, search for a project by name, select a saved BOQ, and verify that all quote metadata and product items load fast.

**Acceptance Scenarios**:

1. **Given** a user opening the saved quotes selector, **When** they click the custom dropdown, **Then** display a styled panel listing saved BOQs with search filtering, quotation numbers, and locations.
2. **Given** a selected quote, **When** clicked, **Then** fetch quote details, populate metadata & item tables, and close the dropdown smoothly.

---

### User Story 2 - Specification Column & Popup Modal in BOQ Lists (Priority: P2)

As a technical architect reviewing BOQs, I want a Specification column in Hardware, Software, and Service item lists with a popup viewer modal, so I can inspect comprehensive technical specifications, make, and model details.

**Why this priority**: Detailed specifications are required during pre-sales engineering reviews and client presentations.

**Independent Test**: Add an item to the BOQ table and click the Specification badge or Make/Model info icon to open the full detail modal.

**Acceptance Scenarios**:

1. **Given** a product row in Hardware/Software/Service table, **When** rendered, **Then** display a dedicated "Specification" column with truncated text preview or a clickable badge.
2. **Given** a user clicking the Specification preview or Make/Model badge, **When** clicked, **Then** open a modern Modal displaying complete specification text, product name, make, and model.

---

### User Story 3 - Search Autocomplete & UI Polish (Priority: P3)

As a user assembling a quote, I want product search autocomplete to populate all product properties (Make, Model, UOM, Prices, Specification) cleanly with a polished table layout.

**Why this priority**: Speeds up quote creation and guarantees zero pricing errors.

**Independent Test**: Type a product name in the search bar, click a search result, and verify that all item fields (including Specification) auto-populate accurately.

**Acceptance Scenarios**:

1. **Given** search query typed, **When** matching products return, **Then** selecting a product populates `productName`, `make`, `model`, `uom`, `buyingPrice`, `listPrice`, `discount`, `salesPrice`, `salesMargin`, and `specification`.
2. **Given** table layout rendered, **When** inspecting columns, **Then** ensure proper spacing, responsive text wrapping, and clean design.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST replace native `<select>` saved BOQ dropdown with a custom interactive dropdown component featuring search filtering and quote metadata badges.
- **FR-002**: BOQ item tables (Hardware, Software, Service) MUST include a **Specification** column.
- **FR-003**: System MUST provide a modal/popup dialog to view complete specification details when a user clicks an item's specification cell or info button.
- **FR-004**: Product search autocomplete MUST populate specification text along with pricing, make, model, and UOM.
- **FR-005**: All totals, margins, AMC calculations, and PDF/CSV exports MUST include specification data where appropriate.

### Key Entities

- **BOQ Item**: `{ productName, make, model, specification, uom, quantity, buyingPrice, listPrice, discount, salesPrice, salesMargin, totalBuy, totalSales }`.
- **Saved BOQ Summary**: `{ id, projectName, projectLocation, quotationNumber, solutionTitle, totals }`.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Custom saved BOQ dropdown loads quote details in $< 200\text{ ms}$.
- **SC-002**: 100% of product specifications accessible via modal viewer.
- **SC-003**: 0 layout overflow or calculation errors.

## Assumptions

- Specifications are stored as text strings in the catalog database.
