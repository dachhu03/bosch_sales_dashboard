# Tasks: BOQ Generator Optimization & Specification Viewer

**Spec**: [`spec.md`](spec.md)
**Plan**: [`plan.md`](plan.md)

## Task Breakdown

### Phase 1: Frontend Component Enhancements (`frontend/src/pages/BOQGenerator.jsx`)
- [x] **Task 1.1**: Replace native `<select>` dropdown for saved quotes with a custom searchable interactive dropdown menu component.
- [x] **Task 1.2**: Add **Specification** column to Hardware, Software, and Service product item tables.
- [x] **Task 1.3**: Implement Specification Viewer Popup Modal to read full specification details along with Make and Model.
- [x] **Task 1.4**: Ensure search autocomplete maps `specification`, `make`, `model`, `uom`, and prices automatically.

### Phase 2: Quality Assurance & Build Verification
- [x] **Task 2.1**: Run `node --check routes/products.js` to verify backend syntax integrity.
- [x] **Task 2.2**: Run `npx vite build` to confirm production React compilation.
