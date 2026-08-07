# Tasks: Optimizing Delete All & Catalog Wipe

**Spec**: [`spec.md`](spec.md)
**Plan**: [`plan.md`](plan.md)

## Task Breakdown

### Phase 1: Backend Optimization (`backend/routes/products.js`)
- [x] **Task 1.1**: Update `POST /api/products/delete-all` to fetch only `product_image` column for media file cleanup.
- [x] **Task 1.2**: Execute fast table record wipe using `delete().gt('id', 0)`.

### Phase 2: Frontend Wipe Modal UX (`frontend/src/pages/Ratecard.jsx`)
- [x] **Task 2.1**: Add `isDeletingAll` state hook to manage execution lifecycle.
- [x] **Task 2.2**: Update Wipe Database modal action button to display an inline animated spinner (`Wiping Data...`) and lock inputs.
- [x] **Task 2.3**: Reset product catalog state (`setProducts([])`) and close modal smoothly upon completion.

### Phase 3: Quality Assurance & Verification
- [x] **Task 3.1**: Run `node --check routes/products.js` to verify backend syntax.
- [x] **Task 3.2**: Run `npx vite build` to confirm production React compilation.
