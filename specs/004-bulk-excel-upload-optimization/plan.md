# Implementation Plan - Bulk Excel Upload Optimization & Duplicate Prevention

**User Spec**: [`spec.md`](spec.md)
**Feature Branch**: `004-bulk-excel-upload-optimization`

## Technical Architecture

```mermaid
flowchart TD
    A[User Selects Excel File in Ratecard.jsx] --> B[Frontend Displays Animated Lazy Loader Modal]
    B --> C[POST multipart/form-data to /api/products/upload]
    C --> D[Express Route backend/routes/products.js]
    D --> E[1. Pre-fetch Existing Product Keys from Supabase DB]
    E --> F[2. Build O(1) In-Memory Lookup Set]
    F --> G[3. Parse Spreadsheet Rows & Check Duplicate Keys]
    G --> H{Duplicate Exists?}
    H -- Yes --> I[Increment Skipped Duplicates Counter]
    H -- No --> J[Add Payload to Batch Array & Update In-Memory Set]
    J --> K[4. Perform Chunked Batch Inserts - 100 rows/batch]
    K --> L[Return Summary JSON Response]
    L --> M[Frontend Hides Loader Modal & Displays Toast Notification]
```

## Proposed Changes

### Backend Infrastructure (`backend/routes/products.js`)

1. **Pre-fetch Unique Product Identifiers**:
   - Query `select('application, category, product_name, make, model')` from `exapp_totalsolutions` in a single SQL operation.
   - Store formatted keys in an $O(1)$ `Set` data structure: `app|cat|name|make|model`.

2. **In-Memory Duplicate Filtering**:
   - Parse rows from the Excel/CSV workbook stream.
   - Filter out matching entries using `existingSet.has(duplicateKey)` to prevent database duplicates and intra-file duplicates.

3. **Chunked Batch Database Insertion**:
   - Accumulate non-duplicate items into a `rowsToInsert` array.
   - Batch insert rows into Supabase using `insert(batch)` with `BATCH_SIZE = 100`.

### Frontend Component (`frontend/src/pages/Ratecard.jsx`)

1. **Active Processing State & Lazy Loader Modal**:
   - Track `isUploading` state.
   - Render a high-contrast animated overlay with a spinner, pulse effect, and upload status notice while upload completes.
   - Disable file selection and submission controls during processing.

2. **Notification & Table Synchronization**:
   - Update state dynamically upon response receipt and display toast notifications with statistics.

## Verification & Testing Plan

1. **Syntax & Unit Checks**:
   - Run `node --check routes/products.js` to ensure zero syntax or scope errors.
   - Run `npx vite build` in `frontend` to verify React compilation.
2. **Performance Benchmarking**:
   - Test spreadsheet import with 1,000+ items to verify < 3-second completion time.
3. **Duplicate Verification**:
   - Attempt uploading identical products repeatedly and verify that duplicate counts reflect accurately while database table rows remain unique.
