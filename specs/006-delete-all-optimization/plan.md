# Implementation Plan - Optimizing Delete All & Catalog Wipe

**User Spec**: [`spec.md`](spec.md)
**Feature Branch**: `006-delete-all-optimization`

## Technical Architecture

```mermaid
flowchart TD
    A[User Confirms Wipe Catalog in Modal] --> B[Frontend locks UI & sets isDeletingAll state]
    B --> C[POST /api/products/delete-all]
    C --> D[Express Route backend/routes/products.js]
    D --> E[1. Query only product_image column for media cleanup]
    E --> F[2. Remove physical image files from disk]
    F --> G[3. Fast DB delete: delete().gt('id', 0)]
    G --> H[Return HTTP 200 Success Message]
    H --> I[Frontend clears local products state & displays success toast]
```

## Proposed Changes

### Backend Route (`backend/routes/products.js`)

1. **Lightweight Media Query in `POST /api/products/delete-all`**:
   - Query `select('product_image')` from `exapp_totalsolutions` instead of heavy `select('*')`.
   - Remove physical files safely.

2. **Fast Database Record Wipe**:
   - Execute `delete().gt('id', 0)`.

### Frontend Modal (`frontend/src/pages/Ratecard.jsx`)

1. **State Management**:
   - `isDeletingAll`: Locks action buttons and displays an inline spinner (`Wiping Data...`) on the submit button.
   - Clears catalog state `setProducts([])` immediately upon completion.

## Verification & Testing Plan

1. **Delete All Test**:
   - Click "Wipe Catalog", confirm on modal.
   - Verify smooth loading spinner without UI freezes and instant grid clearing.
