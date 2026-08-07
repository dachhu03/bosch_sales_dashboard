# Implementation Plan: Dashboard Optimization

**Branch**: `010-dashboard-optimization` | **Date**: 2026-08-04 | **Spec**: [`specs/010-dashboard-optimization/spec.md`](spec.md)

**Input**: Feature specification from `specs/010-dashboard-optimization/spec.md`

## Summary

The Dashboard Optimization feature enhances the Bosch Pre-sales CRM dashboard with three key capabilities:
1. **Interactive Category Breakdown Pie Chart**: Fixing Recharts tooltip configuration and adding a custom tooltip component that displays category names, exact item counts, and calculated percentage share on hover.
2. **Quote Profit Margin Comparison Chart**: Replacing the legacy Volume Comparison graph with a Profit Margin Comparison chart visualising profitability across active quotes and BOQs.
3. **Global Dark & Light Theme System**: Adding a theme toggle in the application header powered by React Context, Tailwind CSS `darkMode: 'class'`, and `localStorage` persistence.

---

## Technical Context

**Language/Version**: JavaScript (ES2022) / JSX  
**Primary Dependencies**: React 18, Recharts 2.12, Tailwind CSS 3.4, Lucide React, Framer Motion, Axios  
**Storage**: `localStorage` (theme persistence), PostgreSQL via Supabase / Express backend  
**Testing**: Manual quickstart validation, component rendering verification  
**Target Platform**: Web Browsers (Chrome, Edge, Firefox, Safari)  
**Project Type**: Full-stack Web Application (React SPA frontend + Node/Express backend)  
**Performance Goals**: Theme switch response $< 100\text{ ms}$, dashboard metrics render $< 1\text{ second}$  
**Constraints**: Zero regressions to existing BOQ Generator, Ratecard, or Reports modules  
**Scale/Scope**: Dashboard overview widgets, global header navigation, theme context  

---

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Library-First / Component Isolation**: Theme Provider and Dashboard Charts are encapsulated as modular components under `frontend/src/`.
- **User Experience & Non-Regression**: Styling and component changes must not break existing ratecard data loading, BOQ calculation routines, or report downloads.
- **Simplicity & Standard Patterns**: Tailwind class-based dark mode (`.dark`) and Recharts custom tooltips leverage industry standards without custom CSS engine overhead.

**Status**: PASS

---

## Project Structure

### Documentation (this feature)

```text
specs/010-dashboard-optimization/
├── plan.md              # Implementation plan
├── research.md          # Research findings & decisions
├── data-model.md        # Data entities & state models
├── quickstart.md        # Validation guide
└── contracts/           # API and UI interface contracts
    ├── theme-contract.md
    └── dashboard-api-contract.md
```

### Source Code (repository root)

```text
frontend/
├── src/
│   ├── components/
│   │   ├── Sidebar.jsx            # Updated for theme support
│   │   └── ThemeToggle.jsx        # New theme switcher component
│   ├── context/
│   │   └── ThemeContext.jsx       # Theme provider & hook
│   ├── pages/
│   │   ├── Dashboard.jsx          # Optimized pie chart & profit margin graph
│   │   ├── BOQGenerator.jsx       # Theme-adapted view
│   │   ├── Ratecard.jsx           # Theme-adapted view
│   │   └── Reports.jsx            # Theme-adapted view
│   ├── App.jsx                    # Wrapped with ThemeProvider
│   └── index.css                  # Tailwind dark theme variables & root styles
```

**Structure Decision**: Web application layout (`frontend/` + `backend/`). Changes focus primarily on frontend components, dashboard charts, and theme context provider, with supporting API endpoints as needed.

---

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| *None* | *All decisions align with constitution and simple architectural patterns* | *N/A* |
