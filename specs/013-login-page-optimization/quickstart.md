# Quickstart & Verification Guide: Login Page Design Optimization

**Feature**: Login Page Design Optimization
**Date**: 2026-08-07
**Spec**: [spec.md](./spec.md) | **Plan**: [plan.md](./plan.md)

## Runnable Verification Steps

### 1. Launch Frontend Local Dev Server
```bash
cd D:/newUser/Pre-sales-CRM/bosch_sales_dashboard/frontend
npm run dev
```

### 2. Visual & Layout Verification (User Story 1 & 2)
1. Open browser at `http://localhost:5173/login` (or active local dev port).
2. **Glass Card Aesthetics**: Verify the centered container displays a translucent light blue frosted glass backdrop with sky-blue ambient glow orbs behind it.
3. **Focus & Glow Animation**: Click into the Username field and Password field. Verify the border smoothly animates to sky-400 with a light blue glowing ring.
4. **Button & Hover Interaction**: Hover over the "Sign In to Portal" button. Verify scale effect (`1.015`) and glow shadow expansion.
5. **Responsiveness**: Toggle DevTools Mobile View (iPhone 14 / Pixel 7). Verify the glass card scales cleanly without overflow or text clipping.

### 3. Functional Authentication Verification (User Story 3)
1. **Invalid Login Attempt**: Enter `wronguser` / `wrongpass` and click Sign In.
   - *Expected*: Smooth error shake animation, followed by red alert box displaying invalid credentials error.
2. **Valid Login Attempt**: Enter valid admin or user credentials and submit.
   - *Expected*: Button displays spinner in loading state, then seamlessly redirects to `/` (Dashboard).
