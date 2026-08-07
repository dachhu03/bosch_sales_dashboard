# Feature Specification: Dashboard Optimization

**Feature Branch**: `010-dashboard-optimization`

**Created**: 2026-08-04

**Status**: Draft

**Input**: User description: "my next feature is \"Dashboard Optimization\" so in the dashboard the category breakdown graph not showing the values when place the cursorn pai graph so please check and solve these so that it work properly and in the place foro volume camparision graph replace the so that i need to so the graph for profit margines of each quoted so that will be maore practical and logical so plaese amke these changes and also try to add the dark mood and light mood toggle button to chenge the website theam apperence and make sure it should work properly and make sure these changes should not affect to other featurs and shoilwork as expected ."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Interactive Category Breakdown Chart Tooltips (Priority: P1)

As a sales manager reviewing the dashboard, I want to hover my cursor over any segment of the Category Breakdown pie chart so that I can immediately view exact values and percentage breakdowns for each category.

**Why this priority**: High visual utility; users currently cannot read exact numbers from the pie chart on hover.

**Independent Test**: Can be tested independently by navigating to the main dashboard, hovering over each slice of the Category Breakdown pie chart, and confirming that the tooltip popover displays accurate category values and percentages.

**Acceptance Scenarios**:

1. **Given** the dashboard is loaded with category breakdown data, **When** the user hovers over a pie chart segment, **Then** a visible tooltip appears displaying the category name, exact numeric value, and percentage share.
2. **Given** the user moves the cursor across different pie chart segments, **Then** the tooltip updates smoothly without visual delay or sticky popups.

---

### User Story 2 - Quote Profit Margin Comparison Chart (Priority: P1)

As a sales executive, I want the dashboard to display a Profit Margin Comparison graph for quoted projects instead of the legacy Volume Comparison graph, so that I can evaluate quote profitability at a glance.

**Why this priority**: Business critical upgrade replacing an unused/less practical metric with logical profit margin analysis for quotes.

**Independent Test**: Can be tested by viewing the dashboard widget location previously occupied by Volume Comparison and verifying that it now displays Profit Margins per quote with clear axes, labels, and profitability indicators.

**Acceptance Scenarios**:

1. **Given** active quotes exist in the CRM, **When** viewing the dashboard graph section, **Then** the Profit Margin Comparison graph displays profit margin percentages/amounts for each quote.
2. **Given** a user hovers over or clicks a quote bar/point on the Profit Margin graph, **Then** detailed quote financial metrics (quote ID/name, gross value, profit margin %) are presented clearly.

---

### User Story 3 - Global Theme Appearance Toggle (Dark / Light Mode) (Priority: P2)

As a user, I want a theme toggle control in the header/navigation bar so that I can seamlessly switch between Dark Mode and Light Mode appearance across the dashboard.

**Why this priority**: Improves user comfort, accessibility, and modern UI aesthetic experience.

**Independent Test**: Can be tested independently by clicking the Theme Toggle button and verifying that all UI components, backgrounds, typography, cards, and charts transition to the selected theme immediately and persist upon page refresh.

**Acceptance Scenarios**:

1. **Given** the user is viewing the application in Light Mode, **When** clicking the Theme Toggle button, **Then** the entire application transitions to Dark Mode (dark backgrounds, high-contrast text, dark-themed charts).
2. **Given** a user sets their theme preference to Dark Mode, **When** reloading the page or returning in a new session, **Then** the Dark Mode setting is remembered and restored automatically.

---

### User Story 4 - Regression Prevention & Dashboard Stability (Priority: P3)

As a CRM user, I want all other existing dashboard widgets, tables, filters, and export options to remain unaffected and fully operational when theme mode changes or graph updates occur.

**Why this priority**: Ensures overall system stability and prevents user workflow disruption.

**Independent Test**: Can be tested by interacting with dashboard date filters, category filters, total solution tables, and report exports in both Light and Dark modes.

**Acceptance Scenarios**:

1. **Given** applied dashboard filters, **When** switching themes or interacting with the new Profit Margin graph, **Then** existing filters and table data remain intact and accurate.

---

### Edge Cases

- What happens when a category has $0 or 0% share? The tooltip should either omit empty categories or display "0 (0%)" cleanly without dividing by zero error.
- What happens when a quote has negative or 0% profit margin? The Profit Margin Comparison chart should render negative bars/indicators clearly with distinct color coding (e.g. red/alert tone).
- What happens when switching theme modes while chart animations or tooltips are open? The chart elements and tooltips should recolor instantly without rendering glitched text contrast.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Category Breakdown pie chart MUST display interactive tooltips showing exact numerical values and percentage breakdown when placing the cursor on any chart segment.
- **FR-002**: Tooltips on the Category Breakdown chart MUST format numeric values with appropriate currency/thousands separators matching project standards.
- **FR-003**: System MUST replace the legacy Volume Comparison graph on the main dashboard layout with a Profit Margin Comparison graph for quoted projects.
- **FR-004**: Profit Margin Comparison graph MUST plot individual quote profitability metrics (profit margin percentage and profit value).
- **FR-005**: System MUST provide a visible Theme Toggle button in the main application header/navigation bar.
- **FR-006**: Theme Toggle MUST allow users to switch dynamically between Light Mode and Dark Mode styling.
- **FR-007**: All dashboard charts (pie chart, profit margin chart, revenue trends) MUST adapt their background, grid lines, text contrast, and color palette automatically when theme mode changes.
- **FR-008**: User theme preference MUST be saved locally (e.g. localStorage) and restored automatically on subsequent page visits.
- **FR-009**: All existing dashboard components, data tables, summary cards, and filters MUST maintain full functional and visual integrity in both Light and Dark modes.

### Key Entities

- **Category Breakdown Chart**: Visual representation of sales breakdown by category, configured with hover event handlers, data formatting, and interactive tooltips.
- **Quote Profitability Data**: Financial entity representing quote identifier, customer/project name, total quoted value, cost, calculated profit margin amount, and profit margin percentage.
- **Theme Manager**: UI state manager controlling active theme ('light' or 'dark'), broadcasting theme changes to registered chart instances and updating CSS custom properties.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of pie chart segments trigger readable tooltips displaying exact values and percentages upon mouse hover or focus.
- **SC-002**: Profit Margin Comparison chart replaces Volume Comparison chart cleanly and loads data within 1 second.
- **SC-003**: Theme toggle responds instantly (< 100ms) upon click, changing application appearance across all visible components without requiring page reload.
- **SC-004**: Zero functional or visual regressions on existing dashboard tables, metrics cards, or filtering mechanisms.

## Assumptions

- Quote data objects contain sufficient financial information (or cost/price attributes) to derive profit margin metrics.
- Theme implementation uses CSS variables or utility classes supported across modern web browsers.
- Charting library (e.g. Chart.js, Recharts, ApexCharts, or custom SVG/D3) supports tooltip configuration and dynamic canvas/theme re-rendering.
