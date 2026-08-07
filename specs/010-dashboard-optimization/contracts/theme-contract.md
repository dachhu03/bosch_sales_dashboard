# Interface Contract: Theme Provider & Toggle API

**Feature**: `010-dashboard-optimization`  
**Contract Type**: UI Context & React Hook Contract

## React Theme Context API

### Context: `ThemeContext`
Exports `theme` state and `toggleTheme` trigger function for consumption across all top-level layouts and widgets.

```typescript
interface ThemeContextType {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}
```

### Custom Hook: `useTheme()`
Returns `ThemeContextType`. Throws explicit error if consumed outside `<ThemeProvider>`.

---

## DOM Contract & CSS Variable Mapping

When `theme === 'dark'`, `<html class="dark">` MUST be present on root DOM element.

### Tailwind Color Mapping Table

| Component Element | Light Mode (`.light`) | Dark Mode (`.dark`) |
|-------------------|----------------------|--------------------|
| Page Background | `bg-slate-50` (`#f8fafc`) | `bg-slate-950` (`#020617`) |
| Content Card Surface | `bg-white` (`#ffffff`) | `bg-slate-900` (`#0f172a`) |
| Card Borders | `border-slate-200` | `border-slate-800` |
| Primary Text | `text-slate-800` | `text-slate-100` |
| Muted Text | `text-slate-400` / `text-slate-500` | `text-slate-400` |
| Chart Grid Lines | `#f1f5f9` | `#1e293b` |
| Chart Axis Labels | `#64748b` | `#94a3b8` |
