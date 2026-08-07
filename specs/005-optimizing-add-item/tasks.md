# Tasks: Optimizing Add Item & Duplicate Validation

**Spec**: [`spec.md`](spec.md)
**Plan**: [`plan.md`](plan.md)

## Task Breakdown

### Phase 1: Backend Duplicate Validation (`backend/routes/products.js`)
- [x] **Task 1.1**: Implement pre-check query in `POST /api/products/add` matching `Application`, `Category`, `Product Name`, `Make`, and `Model`.
- [x] **Task 1.2**: Return HTTP status 409 Conflict with message `"This item already exists in the catalog."` if a matching product exists.
- [x] **Task 1.3**: Insert unique products into `exapp_totalsolutions` with calculated sales margins and pricing.

### Phase 2: Frontend Add Item Modal UX (`frontend/src/pages/Ratecard.jsx`)
- [x] **Task 2.1**: Add `isSubmittingAdd` and `addModalError` state hooks.
- [x] **Task 2.2**: Render styled inline alert banner inside the Add Item modal when `addModalError` is set.
- [x] **Task 2.3**: Update submit button to show an inline animated spinner and disable inputs during save.
- [x] **Task 2.4**: Reset form state and close modal cleanly upon success.

### Phase 3: Verification & Quality Assurance
- [x] **Task 3.1**: Run `node --check routes/products.js` to confirm backend syntax.
- [x] **Task 3.2**: Run `npx vite build` to confirm production React compilation.
