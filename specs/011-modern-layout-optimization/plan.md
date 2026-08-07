# Implementation Plan: Modern Layout Optimization

**Branch**: `011-modern-layout-optimization` | **Date**: 2026-08-04 | **Spec**: [`specs/011-modern-layout-optimization/spec.md`](spec.md)

**Input**: Feature specification from `specs/011-modern-layout-optimization/spec.md`

## Summary

The Modern Layout Optimization feature upgrades the visual aesthetics, micro-animations, typography, and component layouts across all Bosch Pre-sales CRM pages (`Dashboard`, `Ratecard`, `BOQGenerator`, `Reports`, `Login`). It introduces glassmorphism panels, Framer Motion page entries, card hover lifts, tactile button press feedback, monospace tabular typography, and pill status badges, ensuring zero side-effects on existing pre-sales business logic.

---

## Technical Context

**Language/Version**: JavaScript (ES2022) / JSX  
**Primary Dependencies**: React 18, Tailwind CSS 3.4, Framer Motion 11, Lucide React, Recharts  
**Storage**: `localStorage` (theme preferences), PostgreSQL via Supabase / Express backend  
**Testing**: Manual quickstart validation, component render verification  
**Target Platform**: Modern Web Browsers  
**Project Type**: Full-stack Web Application (React SPA frontend + Node/Express backend)  
**Performance Goals**: Framer Motion 60 FPS transitions, hardware-accelerated CSS transforms  
**Constraints**: Zero regressions to ratecard inline editing, BOQ calculations, report filters, or authentication  

---

## Constitution Check

- **UX & Visual Standards**: All pages implement unified glassmorphism styling, shadow depths, and Bosch corporate color accents.
- **Performance Gate**: CSS backdrop blurs and animations utilize hardware acceleration (`transform`, `opacity`), keeping render frames under $16\text{ ms}$.
- **Simplicity**: Builds on existing Tailwind and Framer Motion setup without adding extraneous UI framework dependencies.

**Status**: PASS

---

## Project Structure

### Documentation (this feature)

```text
specs/011-modern-layout-optimization/
├── plan.md              # Implementation plan
├── research.md          # Research findings & decisions
├── data-model.md        # Data & layout tokens model
├── quickstart.md        # Validation guide
└── contracts/           # UI layout contracts
    └── layout-theme-contract.md
```

### Source Code Layout

```text
frontend/
├── src/
│   ├── components/
│   │   ├── Sidebar.jsx            # Updated navigation glows & transitions
│   │   ├── ThemeToggle.jsx        # Styled theme switcher button
│   │   └── EditableCell.jsx       # Monospace numeric formatting
│   ├── pages/
│   │   ├── Dashboard.jsx          # Optimized cards & chart animations
│   │   ├── Ratecard.jsx           # Modern search panel, catalog table & modal overlays
│   │   ├── BOQGenerator.jsx       # Refined BOQ table headers & total summary cards
│   │   ├── Reports.jsx            # Modern report cards & custom dropdowns
│   │   └── Login.jsx              # Modern glassmorphism login card
│   └── App.jsx                    # Glassmorphism header layout wrapper
```

---

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| *None* | *All layout modernizations leverage standard Tailwind & Framer Motion patterns* | *N/A* |
