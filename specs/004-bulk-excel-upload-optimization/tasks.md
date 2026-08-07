# Tasks: Bulk Excel Upload Optimization & Duplicate Prevention

**Spec**: [`spec.md`](spec.md)
**Plan**: [`plan.md`](plan.md)

## Task Breakdown

### Phase 1: Setup & Data Prep
- [x] **Task 1.1**: Define duplicate evaluation key `(Application, Category, Product Name, Make, Model)` logic.
- [x] **Task 1.2**: Define single-query DB pre-fetch strategy to load existing product keys into memory.

### Phase 2: Backend Implementation (`backend/routes/products.js`)
- [x] **Task 2.1**: Implement pre-fetch query `select('application, category, product_name, make, model')` on route upload start.
- [x] **Task 2.2**: Build $O(1)$ lookup `Set` for pre-existing DB catalog items.
- [x] **Task 2.3**: Update row parser loop to skip duplicate rows matching existing keys and intra-file duplicates.
- [x] **Task 2.4**: Refactor insertion loop to perform chunked batch insertions in batches of 100 rows.
- [x] **Task 2.5**: Return structured execution response containing processed, saved, and skipped statistics.

### Phase 3: Frontend Implementation (`frontend/src/pages/Ratecard.jsx`)
- [x] **Task 3.1**: Add `isUploading` state to manage bulk upload execution lifecycle.
- [x] **Task 3.2**: Create an animated lazy loader modal overlay to prevent UI freezing and page crashes during upload.
- [x] **Task 3.3**: Disable modal close buttons and upload inputs while upload is active.
- [x] **Task 3.4**: Display clear completion notifications with detailed counts of added vs skipped entries.

### Phase 4: Quality Assurance & Verification
- [x] **Task 4.1**: Verify syntax with `node --check routes/products.js`.
- [x] **Task 4.2**: Verify React frontend build with `npx vite build`.
- [x] **Task 4.3**: Perform end-to-end testing with sample ratecard spreadsheets.
