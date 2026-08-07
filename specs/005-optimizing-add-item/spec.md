# Feature Specification: Optimizing Add Item & Duplicate Validation

**Feature Branch**: `005-optimizing-add-item`

**Created**: 2026-08-01

**Status**: Draft

**Input**: User description: "Optimize manual Add Item feature to save items fast and smoothly. Check if the item already exists based on Application, Category, Product Name, Make, and Model; if it exists, block saving and display a clear message 'This item already exists in the catalog'. Prevent UI freezing or double-submission during save."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Fast & Smooth Item Saving with Submit State (Priority: P1)

As a pre-sales engineer adding a new product item manually, I want the save action to execute quickly with smooth visual loading feedback on the button, so that the UI never freezes or permits duplicate form submissions.

**Why this priority**: Prevents double-clicking, browser hanging, and unhandled errors when adding items to the catalog.

**Independent Test**: Click "Create Product" on the Add Item modal, verify the submit button immediately shows an inline loading spinner and locks input, then smoothly closes the modal and updates the table on success.

**Acceptance Scenarios**:

1. **Given** a user submitting a valid product form, **When** they click "Create Product", **Then** the submit button enters an active loading state (`isSubmitting: true`) with an animated spinner, preventing double-clicks.
2. **Given** product creation succeeds, **When** backend responds with HTTP 200, **Then** modal closes smoothly, form resets, and newly created item is prepended to the ratecard table.

---

### User Story 2 - Duplicate Product Validation (Priority: P2)

As a catalog administrator, I want the system to check if an item with matching `Application`, `Category`, `Product Name`, `Make`, and `Model` already exists before saving, and notify me if it is a duplicate.

**Why this priority**: Guarantees catalog data integrity by blocking redundant product entries from being saved manually.

**Independent Test**: Attempt adding a product with identical `Application`, `Category`, `Product Name`, `Make`, and `Model` to an existing catalog entry, and verify that saving is blocked with a 409 Conflict error message.

**Acceptance Scenarios**:

1. **Given** an existing product with matching `(Application, Category, Product Name, Make, Model)` (case-insensitive & trimmed), **When** a user attempts to save a new item with those exact values, **Then** backend blocks database insertion and returns HTTP 409 Conflict with message `"This item already exists in the catalog."`.
2. **Given** a duplicate rejection response, **When** frontend receives the 409 error, **Then** display an inline alert message inside the modal: *"This item already exists in the catalog."* while keeping user inputs intact so the user can adjust fields.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Backend `POST /api/products/add` MUST query Supabase for existing items matching `(application, category, product_name, make, model)` (case-insensitive & trimmed).
- **FR-002**: Backend MUST reject duplicate product creation requests with HTTP status `409` and response `{ status: 'error', message: 'This item already exists in the catalog.' }`.
- **FR-003**: Frontend Add Item modal MUST track an `isSubmitting` state to disable submit buttons and prevent double submissions.
- **FR-004**: Frontend Add Item modal MUST render an inline error alert banner if a duplicate error is returned, allowing the user to correct values without losing typed input.
- **FR-005**: System MUST optimize manual item creation response times (< 500ms execution time).

### Key Entities

- **New Product Form Payload**: `application`, `category`, `productName`, `make`, `model`, `specification`, `uom`, `buyingPrice`, `vendor`, `quotationReceivedMonth`, `leadTime`, `remarks`, `listPrice`, `discount`, `product_image`.
- **Composite Duplicate Key**: `application|category|product_name|make|model`.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of duplicate manual product additions blocked with a clear warning message.
- **SC-002**: 0 duplicate records created via manual form submission.
- **SC-003**: Form submission response time < 500ms.

## Assumptions

- Matching logic is case-insensitive and ignores leading/trailing whitespace.
- Category values are normalized (`hardware`, `software`, `service`).
