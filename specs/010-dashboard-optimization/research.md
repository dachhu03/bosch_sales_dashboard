# Research: Dashboard Optimization

**Feature**: `010-dashboard-optimization`  
**Date**: 2026-08-04  
**Status**: Completed

## Executive Summary

This research addresses three core optimization needs for the Bosch Pre-sales CRM Dashboard:
1. Fixing Recharts `PieChart` hover tooltips to explicitly display category names, exact counts, and percentage breakdowns.
2. Designing a new `Profit Margin Comparison` graph component for quoted projects to replace the legacy `Volume Comparison` graph.
3. Implementing a seamless global Theme Provider (Dark/Light mode) with React Context, CSS class toggling on `document.documentElement`, Tailwind CSS theme variables, and `localStorage` persistence.

---

## Technical Decisions & Findings

### Decision 1: Pie Chart Hover Tooltip Fix

- **Context**: On the Category Breakdown doughnut chart, hovering slices does not format or highlight category values cleanly.
- **Root Cause**: Recharts `<Tooltip />` defaulted to basic property extraction without custom formatting or explicit hover payload handlers.
- **Decision**: Implement a custom Recharts Tooltip component (`renderCustomPieTooltip` or `formatter` prop) that formats category counts and calculates percentage shares dynamically:
  ```jsx
  <Tooltip 
    content={({ active, payload }) => {
      if (active && payload && payload.length) {
        const data = payload[0];
        const percent = ((data.value / totalCount) * 100).toFixed(1);
        return (
          <div className="bg-slate-900 text-white p-3 rounded-xl shadow-xl border border-slate-700 text-xs">
            <p className="font-bold flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: data.color }} />
              {data.name}
            </p>
            <p className="mt-1 text-slate-300">Count: <span className="font-semibold text-white">{data.value}</span></p>
            <p className="text-slate-300">Share: <span className="font-semibold text-emerald-400">{percent}%</span></p>
          </div>
        );
      }
      return null;
    }}
  />
  ```
- **Rationale**: Providing an explicit custom Tooltip guarantees high contrast in both Dark and Light themes, exact numeric output, and percentage calculation.
- **Alternatives Considered**: Default Recharts `formatter` prop. Rejected because custom JSX popover gives better control over theme styling, iconography, and percentage math.

---

### Decision 2: Quote Profit Margin Comparison Chart Data & Visuals

- **Context**: The existing dashboard renders a simple `Volume Comparison` bar chart counting items by category. Replacing it with `Profit Margin Comparison` requires plotting profitability across quoted solutions/projects.
- **Decision**: Fetch quotes/BOQ data or product sales margins from the API (`/boq` / `/quotes` / `/products`). Calculate profit margin percentage for each quote using:
  $$\text{Margin } (\%) = \frac{\text{Total Selling Price} - \text{Total Cost}}{\text{Total Selling Price}} \times 100$$
  Render a `BarChart` / `ComposedChart` with custom bar colors based on margin thresholds (e.g. green for $\ge 25\%$, amber for $10-25\%$, rose for $<10\%$).
- **Rationale**: Focuses dashboard metrics directly on deal profitability rather than raw product volume, giving sales engineers actionable business insights.
- **Alternatives Considered**: Raw total sales volume. Rejected because profit margin provides more practical pre-sales insight as requested by the user.

---

### Decision 3: Dark Mode & Light Mode Theme Architecture

- **Context**: The application requires a theme toggle in the navigation header that switches website appearance dynamically without affecting feature functionality.
- **Decision**: Implement a lightweight React `ThemeContext` (`ThemeProvider`) that:
  1. Reads initial theme from `localStorage` (defaulting to `'light'`).
  2. Applies/removes class `'dark'` on `document.documentElement` (`<html class="dark">`).
  3. Provides `theme` state and `toggleTheme()` handler globally.
  4. Integrates Tailwind CSS `darkMode: 'class'` configuration.
  5. Updates background colors, card surfaces, borders, text contrast, and chart axis colors dynamically.
- **Rationale**: Native CSS/Tailwind class toggling on `document.documentElement` ensures immediate re-rendering of all UI elements with zero performance overhead or flickering.
- **Alternatives Considered**: CSS-in-JS style injection. Rejected due to unnecessary bundle bloat and incompatibility with existing Tailwind CSS utilities.

---

## Constitution & Policy Compliance

- **No Breaking Changes**: Theme Context wraps `AuthenticatedLayout` transparently; default props preserve light mode layout for unauthenticated or first-time users.
- **Performance Gate**: Theme toggling operates via DOM class manipulation, resolving in $< 10$ milliseconds.
