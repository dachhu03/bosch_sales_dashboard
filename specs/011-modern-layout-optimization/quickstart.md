# Quickstart Validation Guide: Modern Layout Optimization

**Feature**: `011-modern-layout-optimization`  
**Date**: 2026-08-04  
**Status**: Ready for Implementation

## Overview

This guide outlines manual validation procedures to confirm that:
1. Glassmorphism headers, rounded card surfaces, and curated Bosch colors render across all views.
2. Framer Motion page entries, card hovers, button press effects, and modal dialog scale popups function at 60 FPS.
3. Typography hierarchy, tabular data alignment, and badge styling are clean in both Light and Dark modes.
4. Zero functional regressions occur in BOQ calculation, ratecard editing, report filtering, or user login.

---

## Scenario 1: Overall Layout & Visual Aesthetics Validation

### Steps:
1. Open the Pre-sales CRM application in your browser (`http://localhost:5173` or dev server).
2. Log in and navigate through each page:
   - **Dashboard**: Overview cards, doughnut chart, profit margin comparison graph
   - **Ratecard**: Search panel, category tabs, catalog table, add/upload modals
   - **BOQ Generator**: Solution configuration form, hardware/software/service tables, total solution summary card
   - **Reports**: Active quotes list, status dropdowns, search & filter bars
3. Toggle between Light Mode and Dark Mode using the header Sun/Moon button.

### Expected Outcome:
- All page containers feature rounded corners (`rounded-2xl`), subtle borders (`border-slate-200 dark:border-slate-800`), and depth shadows (`shadow-premium`).
- Header features glassmorphism backdrop blur.
- High visual contrast in both Light and Dark modes.

---

## Scenario 2: Micro-Animations & Motion Testing

### Steps:
1. Hover cursor over dashboard cards, action buttons, and table rows.
2. Click the **Add Item** button in Ratecard to open the Add Item modal.
3. Click tab switches (e.g., Software, Hardware, Service in Ratecard / BOQ Generator).

### Expected Outcome:
- Dashboard cards execute a subtle lift effect (`y: -3px`) with shadow expansion.
- Modal opens with a smooth scale-in popup and blurred backdrop overlay.
- Tab navigation transitions smoothly with zero UI flicker.

---

## Scenario 3: Non-Regression & Business Logic Testing

### Steps:
1. Go to **Ratecard**, edit an item price inline, and apply a 10% global discount.
2. Go to **BOQ Generator**, add hardware and software items, and verify grand total calculations.
3. Go to **Reports**, filter by System Integrator (SI) channel, and update a quote approval status.

### Expected Outcome:
- All calculations, updates, filtering, and database operations complete cleanly with zero errors.
