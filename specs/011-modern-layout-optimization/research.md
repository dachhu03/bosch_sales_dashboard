# Research: Modern Layout Optimization

**Feature**: `011-modern-layout-optimization`  
**Date**: 2026-08-04  
**Status**: Completed

## Executive Summary

This research establishes design decisions, animation patterns, component wrapping strategies, and styling tokens for modernizing the Bosch Pre-sales CRM layout.

---

## Technical Decisions & Findings

### Decision 1: Design System & Styling Architecture

- **Context**: The user requested a professional, modern layout with rich aesthetics, curated corporate color combinations, and glassmorphism styling across all pages (`Dashboard`, `Ratecard`, `BOQGenerator`, `Reports`, `Login`).
- **Decision**: Expand Tailwind CSS configuration with modern surface color tokens, custom shadow depths (`shadow-premium`, `shadow-glass`), glassmorphism utility classes (`glass-panel`, `dark-glass-panel`), and gradient borders:
  - **Light Mode**: Clean slate background (`bg-slate-50`), white card surfaces with 1px border (`border-slate-200/80`), subtle glassmorphism headers.
  - **Dark Mode**: Deep navy slate background (`bg-slate-950`), dark card surfaces (`bg-slate-900`), high-contrast text (`text-slate-100`), glowing accent pill badges.
- **Rationale**: Extends existing Tailwind setup without adding heavy CSS framework overhead, guaranteeing instant rendering speed and theme consistency.

---

### Decision 2: Animation & Micro-Interactions Framework

- **Context**: UI elements (cards, buttons, modal dialogs, tables) require fluid micro-animations to enhance user experience.
- **Decision**: Standardize on Framer Motion 11 and CSS hardware-accelerated transitions:
  - **Page Entry**: Staggered fade and slide-up animations for page containers (`initial={{ opacity: 0, y: 12 }}`).
  - **Card Hover**: Soft elevation lift (`whileHover={{ y: -3, boxShadow: '0 12px 30px -8px rgba(0,0,0,0.12)' }}`).
  - **Button Micro-Interactions**: Active press scaling (`whileTap={{ scale: 0.98 }}`).
  - **Modal Popovers**: Scale/fade animations (`initial={{ opacity: 0, scale: 0.95 }}`).
- **Rationale**: Framer Motion is already installed in `frontend/package.json` (`framer-motion ^11.2.10`). Using hardware-accelerated transforms guarantees 60 FPS performance without layout reflows.

---

### Decision 3: Typography & High-Density Table Layouts

- **Context**: Ratecard catalog tables and BOQ quote generators contain dense monetary and technical specification data that must remain highly legible.
- **Decision**:
  1. Use Inter sans-serif font pairing with explicit tracking (`tracking-tight` for titles, `tracking-wide` for badges).
  2. Format numeric prices and calculated margins with tabular monospace fonts (`font-mono`).
  3. Wrap category indicators in rounded pill badges with category-specific tinting (Software: Bosch Light Blue, Hardware: Rose, Service: Emerald).

---

## Constitution & Policy Compliance

- **No Breaking Changes**: All layout enhancements modify UI wrappers and CSS classes without touching business logic or API contracts.
- **Performance Gate**: All CSS backdrop blurs and Framer Motion transforms use hardware acceleration, keeping render times $< 16\text{ ms}$ per frame (60 FPS).
