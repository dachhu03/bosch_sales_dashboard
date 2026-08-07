# Developer Quickstart & Verification Guide: Bosch Sales CRM

**Feature**: [spec.md](file:///D:/newUser/Pre-sales-CRM/bosch_sales_dashboard/specs/001-crm-baseline-spec/spec.md) | **Plan**: [plan.md](file:///D:/newUser/Pre-sales-CRM/bosch_sales_dashboard/specs/001-crm-baseline-spec/plan.md) | **Data Model**: [data-model.md](file:///D:/newUser/Pre-sales-CRM/bosch_sales_dashboard/specs/001-crm-baseline-spec/data-model.md) | **API Contracts**: [api-contracts.md](file:///D:/newUser/Pre-sales-CRM/bosch_sales_dashboard/specs/001-crm-baseline-spec/contracts/api-contracts.md)  
**Date**: 2026-07-31  

---

## 1. Prerequisites & Environment Setup

Ensure the following tools are installed on your local development system:
- **Node.js**: v18.x or higher
- **npm**: v9.x or higher
- **PostgreSQL**: PostgreSQL 14+ instance running locally or via Supabase
- **Git**

---

## 2. Environment Configuration

### Backend Setup (`/backend`)
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install npm dependencies:
   ```bash
   npm install
   ```
3. Copy environment configuration template:
   ```bash
   cp .env.example .env
   ```
4. Configure required variables in `.env`:
   ```env
   PORT=5000
   DATABASE_URL="postgresql://user:password@localhost:5432/bosch_crm?schema=public"
   JWT_SECRET="your_jwt_secret_key"
   SUPABASE_URL="https://your-supabase-project.supabase.co"
   SUPABASE_KEY="your-supabase-anon-key"
   ```
5. Apply database schema migrations / seed data:
   ```bash
   npx prisma db push
   ```

### Frontend Setup (`/frontend`)
1. Navigate to the frontend directory:
   ```bash
   cd ../frontend
   ```
2. Install npm dependencies:
   ```bash
   npm install
   ```
3. Configure environment variables in `.env`:
   ```env
   VITE_API_BASE_URL="http://localhost:5000/api"
   ```

---

## 3. Running Development Servers

### Start Backend API Server
```bash
# In /backend directory
npm run dev
# Expected output: Server running on port 5000 | Database connected
```

### Start Frontend Vite Dev Server
```bash
# In /frontend directory
npm run dev
# Expected output: Local: http://localhost:5173/
```

---

## 4. End-to-End Verification Scenarios

### Scenario 1: Authentication & JWT Protection
1. Open browser to `http://localhost:5173`.
2. Enter valid user credentials (e.g., username `admin`, password `adminpass`).
3. Verify redirection to Dashboard (`/dashboard`).
4. Inspect browser Local Storage to confirm `token` string is saved.
5. Attempt navigating directly to `/admin` as a non-staff user; confirm redirection to `/dashboard`.

### Scenario 2: Product & Solution Catalog Verification
1. Navigate to Products (`/products`).
2. Verify list displays existing solution records matching `exapp_totalsolutions`.
3. Filter by category "Sensors"; confirm list updates dynamically.
4. Click Edit Price on a product; update List Price and Margin.
5. Confirm updated sales price and timestamp persist upon refresh.

### Scenario 3: Customer & Quotation Pipeline Flow
1. Navigate to Customers (`/customers`); click "Add Customer".
2. Create customer "Tesla Automation Solutions".
3. Navigate to Sales Pipeline (`/sales`); create opportunity "Robot Cell Setup".
4. Construct BOQ with line items from Product Catalog.
5. Verify grand total calculation matches `quantity * unit_sales_price`.
6. Export quotation report to Excel; confirm `.xlsx` file downloads and opens cleanly.

---

## 5. Automated Test Execution

Run backend and frontend automated test suites:

```bash
# Backend unit & API contract tests
cd backend
npm test

# Frontend component & route tests
cd ../frontend
npm test
```
