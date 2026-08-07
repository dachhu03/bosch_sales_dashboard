# Feature Specification: Bulk Excel Upload Optimization & Duplicate Prevention

**Feature Branch**: `004-bulk-excel-upload-optimization`

**Created**: 2026-08-01

**Status**: Draft

**Input**: User description: "Optimize Excel file bulk upload to increase upload speed, add lazy loader / progress indicator to avoid crashes & UI freezing for a smooth user experience, and skip duplicate rows based on Application, Category, Product Name/Make, and Model."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Fast & Smooth Bulk Excel Spreadsheet Upload (Priority: P1)

As a pre-sales or sales engineer uploading large product catalog spreadsheets (100 to 5,000+ rows), I want the system to process the file in seconds without freezing the page or crashing the browser.

**Why this priority**: Users upload extensive ratecards containing hundreds or thousands of hardware/software/service products. Slow uploads block work and cause browser timeouts.

**Independent Test**: Upload an Excel file containing 1,000+ rows and observe that the operation completes within seconds with real-time visual progress feedback.

**Acceptance Scenarios**:

1. **Given** an Excel spreadsheet with 1,000 product items, **When** the user clicks "Upload", **Then** the UI displays an overlay lazy loader / progress modal instead of freezing.
2. **Given** a valid spreadsheet upload request, **When** backend processes rows, **Then** backend pre-fetches catalog keys into memory and executes chunked batch inserts (100 rows/batch) rather than single-row queries.
3. **Given** processing completes, **When** backend responds, **Then** frontend dismisses loader, updates ratecard table immediately, and displays a summary of added vs. skipped rows.

---

### User Story 2 - Automated Duplicate Row Skipping (Priority: P2)

As a catalog administrator, I want duplicate products automatically identified and skipped based on matching `Application`, `Category`, `Product Name`, `Make`, and `Model` fields, so that catalog data remains clean.

**Why this priority**: Prevents redundant entries in the `exapp_totalsolutions` database table when uploading updated or overlapping spreadsheets.

**Independent Test**: Upload an Excel file containing items that already exist in the database and verify that duplicates are skipped while unique items are inserted.

**Acceptance Scenarios**:

1. **Given** a row in the spreadsheet where `(Application, Category, Product Name, Make, Model)` matches an existing item in the database, **When** upload executes, **Then** the row is marked as duplicate and skipped.
2. **Given** duplicate rows within the uploaded Excel sheet itself, **When** upload executes, **Then** only the first occurrence is saved and subsequent duplicate rows in the file are skipped.
3. **Given** upload completion, **When** summary notification renders, **Then** it explicitly details: *"Processed X rows: Y inserted, Z skipped as duplicates"*.

---

### User Story 3 - Responsive UI Progress & Lazy Loader (Priority: P3)

As a user, I want visual feedback showing upload progress and a lazy loader state, so that I know the system is actively working and not frozen.

**Why this priority**: Prevents user frustration and duplicate file submissions during background processing.

**Independent Test**: Initiate a bulk file upload and verify that the screen shows an active progress overlay with dynamic status text.

**Acceptance Scenarios**:

1. **Given** file upload start, **When** file is selected, **Then** display an animated lazy loader modal showing upload progress.
2. **Given** upload failure or invalid format, **When** error occurs, **Then** dismiss loader safely and display a helpful toast error message without crashing the UI.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Backend MUST pre-fetch existing catalog key combinations (`application`, `category`, `product_name`, `make`, `model`) into an $O(1)$ memory lookup `Set` to evaluate duplicates instantly.
- **FR-002**: Backend MUST skip duplicate items based on matching `(Application, Category, Product Name, Make, Model)` (case-insensitive & trimmed).
- **FR-003**: Backend MUST insert non-duplicate rows using chunked batch insertions (100 rows per `insert()` call) to minimize Supabase network round-trips.
- **FR-004**: Frontend MUST show a lazy loader / progress overlay during file upload to prevent UI interaction or freezing.
- **FR-005**: Frontend MUST smoothly refresh the product ratecard grid immediately after successful upload.
- **FR-006**: System MUST return clear execution statistics: total rows scanned, items added, and duplicates skipped.

### Key Entities

- **Upload Sheet**: Excel (`.xlsx`, `.xls`) or `.csv` spreadsheet containing product rows.
- **Product Entity (`exapp_totalsolutions`)**: Database record composed of `application`, `category`, `product_name`, `make`, `model`, pricing, and specs.
- **Duplicate Composite Key**: Unique combination of `application|category|product_name|make|model`.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Bulk upload execution speed increased by at least 20x (e.g. 1,000 rows processed under 3 seconds).
- **SC-002**: 0 UI freezes or browser unresponsiveness during bulk upload operations.
- **SC-003**: 100% accuracy in detecting and skipping duplicate catalog entries across pre-existing DB records and in-file duplicates.

## Assumptions

- Excel spreadsheets follow standard header names: `application`, `category`, `product_name`, `make`, `model`, `specification`, `uom`, `buying_price`, `vendor`, `quotation_received_month`, `lead_time`, `remarks`, `list_price`, `discount`.
- Backend utilizes memory batching for sheets up to 20,000 rows.
