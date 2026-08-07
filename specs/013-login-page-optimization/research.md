# Research & Technical Decisions: Login Page Design Optimization

**Feature**: Login Page Design Optimization
**Date**: 2026-08-07
**Spec**: [spec.md](./spec.md) | **Plan**: [plan.md](./plan.md)

## 1. Light Blue Glassmorphism Styling System

### Decision
Implement custom utility classes `.light-blue-glass-card`, `.ambient-glass-bg`, and `.glass-input-field` in `frontend/src/index.css` leveraging TailwindCSS backdrop utilities and CSS custom variables.

### Rationale
- Standard Tailwind utilities allow fast, hardware-accelerated `backdrop-filter: blur(16px)` rendering across Chromium, WebKit, and Gecko engines.
- Combining a subtle gradient border (`border: 1px solid rgba(186, 230, 253, 0.3)`) with a translucent background (`rgba(15, 23, 42, 0.75)` overlaid with soft ice-blue highlights `rgba(56, 189, 248, 0.08)`) creates a sleek, multi-layered depth.

### Alternatives Considered
- **Pure CSS Heavy Custom Rules**: Harder to maintain alongside existing Tailwind utility classes in `index.css`.
- **Inline Style Objects**: Causes unnecessary React re-renders and clutters JSX markup.

---

## 2. Interactive Animations & Micro-Interactions

### Decision
Utilize `framer-motion` for spring-physics entrance animations, interactive hover/tap states, and keyframe error shakes.

### Specific Motion Configurations
- **Card Entrance**: `initial={{ opacity: 0, y: 24, scale: 0.96 }}` -> `animate={{ opacity: 1, y: 0, scale: 1 }}` with `transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}`.
- **Error Shake Effect**: `animate={{ x: [-8, 8, -6, 6, -3, 3, 0] }}` with `transition={{ duration: 0.4 }}`.
- **Input Focus State**: Smooth ring scaling and border color shift from `slate-800` to `#38bdf8` (sky-400) with glowing box-shadow `0 0 15px rgba(56, 189, 248, 0.25)`.
- **Button Hover & Tap**: `whileHover={{ scale: 1.015, boxShadow: "0 10px 30px -5px rgba(14, 165, 233, 0.4)" }}` and `whileTap={{ scale: 0.985 }}`.

---

## 3. Backward Compatibility & Auth State Contract

### Decision
Retain exact prop signatures, internal state hooks (`username`, `password`, `error`, `submitting`), and navigation calls to `useAuth().login(username, password)`.

### Rationale
- Guarantees zero disruption to existing session management or Supabase client auth logic.
- Completely isolates changes to visual presentation and layout structure.

---

## 4. Accessibility & Contrast (WCAG Compliance)

### Decision
Use high-contrast text tokens (`text-slate-100` for primary labels, `text-sky-300` for accents, `text-slate-400` for placeholders) on the glass container to guarantee a minimum contrast ratio of 4.5:1 (AA) and 7:1 (AAA) for body elements.
