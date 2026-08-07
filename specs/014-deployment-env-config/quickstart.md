# Quickstart & Verification Guide: Deployment Environment Configuration Update

**Feature**: Deployment Environment Configuration Update
**Date**: 2026-08-07
**Spec**: [spec.md](./spec.md) | **Plan**: [plan.md](./plan.md)

## Runnable Verification Steps

### 1. Local Development Verification (User Story 1 & 3)
1. Launch local backend:
   ```bash
   cd D:/newUser/Pre-sales-CRM/bosch_sales_dashboard/backend
   npm run dev
   ```
2. Launch local frontend:
   ```bash
   cd D:/newUser/Pre-sales-CRM/bosch_sales_dashboard/frontend
   npm run dev
   ```
3. Open browser DevTools (Network tab) at `http://localhost:5173`.
4. Perform login, view Ratecard products, export BOQ, view Reports.
5. **Verify**: All API calls target `http://localhost:5000/api` with zero errors.

### 2. Production Environment Variable Emulation (User Story 1 & 2)
1. In `frontend`, test building with custom environment variable:
   ```bash
   VITE_API_URL="https://bosch-sales-dashboard.onrender.com/api" npm run build
   ```
2. Verify production build succeeds without errors.
3. Test backend CORS origin handling:
   ```bash
   curl -H "Origin: https://bosch-sales-dashboard.vercel.app" \
        -H "Access-Control-Request-Method: GET" \
        -X OPTIONS \
        http://localhost:5000/api/auth/session -v
   ```
4. **Verify**: Response includes `Access-Control-Allow-Origin: https://bosch-sales-dashboard.vercel.app` and `Access-Control-Allow-Credentials: true`.
