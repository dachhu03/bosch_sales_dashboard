# Quickstart Validation Guide: Dashboard Optimization

**Feature**: `010-dashboard-optimization`  
**Date**: 2026-08-04  
**Status**: Ready for Implementation

## Overview

This validation guide outlines manual and automated testing scenarios to verify that:
1. Pie chart hover tooltips display category names, counts, and percentages cleanly.
2. Profit Margin Comparison chart correctly replaces Volume Comparison graph and displays quote margins.
3. Theme toggle switches website theme between Light and Dark mode without regressions.

---

## Scenario 1: Category Breakdown Pie Chart Tooltip Verification

### Steps:
1. Open the Bosch Pre-sales CRM application in your browser and log in.
2. Navigate to the **Dashboard Overview** page (`/`).
3. Hover your cursor over each colored slice of the Category Breakdown doughnut chart.

### Expected Outcome:
- A high-contrast tooltip appears attached to the hovered slice.
- Tooltip displays:
  - Category Title (Software / Hardware / Service) with matching color indicator
  - Exact Item Count (e.g. `14 items`)
  - Percentage Share of Total (e.g. `27.5%`)
- Tooltip disappears cleanly when moving cursor off the pie chart.

---

## Scenario 2: Profit Margin Comparison Graph Verification

### Steps:
1. On the **Dashboard Overview** page, observe the second chart card.
2. Verify that the title reads **Quote Profit Margins** (or **Profit Margin Comparison**) instead of Volume Comparison.
3. Inspect the bar chart items representing quotes.

### Expected Outcome:
- Each bar represents a quoted project/solution.
- Y-axis shows Profit Margin % (or monetary margin amount).
- Hovering a quote bar displays Quote Name, Total Value, and Profit Margin %.

---

## Scenario 3: Dark Mode & Light Mode Theme Toggle Verification

### Steps:
1. Locate the Sun / Moon Theme Toggle icon button in the header/top navigation.
2. Click the Theme Toggle button.
3. Refresh the browser page (`F5`).
4. Click the Theme Toggle button a second time.

### Expected Outcome:
- Upon step 2: Page background, cards, text, sidebar, and chart gridlines transition immediately to Dark Mode styling (`.dark` class added to `<html>`).
- Upon step 3: Dark Mode setting persists after page reload (`localStorage` preference restored).
- Upon step 4: Application returns cleanly to Light Mode styling.

---

## Scenario 4: Regression Prevention Test

### Steps:
1. Navigate to **Ratecard**, **BOQ Generator**, and **Reports** pages.
2. Switch themes between Light and Dark modes on each page.
3. Perform standard operations (e.g., adding BOQ items, filtering ratecards).

### Expected Outcome:
- All pages render with proper contrast and styling in both themes.
- Core functions (BOQ creation, calculations, exports) operate with zero errors or layout breakages.
