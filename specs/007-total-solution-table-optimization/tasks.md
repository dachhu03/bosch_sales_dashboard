# Tasks: Total Solution Table Optimization & Global Discount

**Spec**: [`spec.md`](spec.md)
**Plan**: [`plan.md`](plan.md)

## Task Breakdown

### Phase 1: Backend Optimization (`backend/routes/products.js`)
- [x] **Task 1.1**: Refine `getBuyingPriceColor(updatedAt)` function ($\le 30$ days green, $\le 60$ days yellow, $> 60$ days red).
- [x] **Task 1.2**: Implement `POST /api/products/apply-global-discount` endpoint to update catalog discount and recalculate sales prices & margins.

### Phase 2: Frontend Table & Modal UX (`frontend/src/pages/Ratecard.jsx` & `EditableCell.jsx`)
- [x] **Task 2.1**: Render color-coded buy price badges based on quotation age thresholds.
- [x] **Task 2.2**: Add Global Discount input and "Apply to All" button in Ratecard filter bar.
- [x] **Task 2.3**: Replace native `window.confirm` popup with a custom Single Item Delete Confirmation Modal.
- [x] **Task 2.4**: Add loading spinner state for single item deletion.

### Phase 3: Quality Assurance & Verification
- [x] **Task 3.1**: Run `node --check routes/products.js` to verify backend syntax.
- [x] **Task 3.2**: Run `npx vite build` to verify production React compilation.
