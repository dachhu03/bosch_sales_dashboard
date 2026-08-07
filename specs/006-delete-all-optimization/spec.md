# Feature Specification: Optimizing Delete All & Catalog Wipe

**Feature Branch**: `006-delete-all-optimization`

**Created**: 2026-08-01

**Status**: Draft

**Input**: User description: "Optimize delete all feature so when user clicks delete all to wipe the whole catalog, it runs fast and smoothly without UI freezing or double submission."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Fast & Smooth Catalog Wipe with Loading Feedback (Priority: P1)

As a catalog administrator clearing product inventory, I want the "Wipe Catalog" / "Delete All" action to execute quickly with smooth visual loading feedback on the button, so that the UI never freezes or permits double submissions.

**Why this priority**: Deleting all catalog records is a critical bulk operation. Providing clear feedback and preventing UI hangs ensures a smooth user experience.

**Independent Test**: Open the Wipe Catalog modal, click "Wipe Data", and verify that the button immediately shows an inline loading spinner (`Wiping Data...`), disables inputs, and smoothly closes upon completion while instantly updating the table grid.

**Acceptance Scenarios**:

1. **Given** a user confirming catalog wipe, **When** they click "Wipe Data", **Then** the button enters an active loading state (`isDeletingAll: true`) with an animated spinner, preventing double clicks.
2. **Given** database delete execution completes, **When** backend returns HTTP 200, **Then** modal closes smoothly, catalog table state is instantly cleared (`setProducts([])`), and success toast renders.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Backend `POST /api/products/delete-all` MUST optimize media image query to select only `product_image` (`select('product_image')`) for image file cleanup.
- **FR-002**: Backend MUST execute fast database record deletion using `delete().gt('id', 0)`.
- **FR-003**: Frontend Wipe Database modal MUST track `isDeletingAll` state to lock action buttons and display an inline loading spinner (`Wiping Data...`).
- **FR-004**: System MUST complete catalog wipe operations under 1 second.

### Key Entities

- **Wipe Request**: Confirmation trigger to delete all product rows from `exapp_totalsolutions` and associated media files from local disk.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 0 UI freezes or unresponsiveness during catalog wipe.
- **SC-002**: 100% of product records and associated media files deleted.
- **SC-003**: Wipe operation execution time < 1 second.

## Assumptions

- Admin user confirms deletion via modal before execution.
