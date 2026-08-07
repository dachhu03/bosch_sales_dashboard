# REST API Interface Contracts: Bosch Sales CRM Baseline

**Feature**: [spec.md](file:///D:/newUser/Pre-sales-CRM/bosch_sales_dashboard/specs/001-crm-baseline-spec/spec.md) | **Plan**: [plan.md](file:///D:/newUser/Pre-sales-CRM/bosch_sales_dashboard/specs/001-crm-baseline-spec/plan.md)  
**Date**: 2026-07-31  

All endpoints require `Content-Type: application/json` unless otherwise specified. Protected endpoints require `Authorization: Bearer <token>`.

---

## 1. Authentication Endpoints (`/api/auth`)

### 1.1 `POST /api/auth/login`
Authenticates a user and issues a JWT token.

- **Auth**: Public
- **Request Body**:
  ```json
  {
    "username": "sales_exec_1",
    "password": "SecurePassword123!"
  }
  ```
- **Response `200 OK`**:
  ```json
  {
    "success": true,
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "username": "sales_exec_1",
      "email": "exec1@bosch.com",
      "first_name": "John",
      "last_name": "Doe",
      "is_staff": 1,
      "is_superuser": 0
    }
  }
  ```
- **Response `401 Unauthorized`**:
  ```json
  {
    "success": false,
    "message": "Invalid username or password"
  }
  ```

---

## 2. Customer Endpoints (`/api/customers`)

### 2.1 `GET /api/customers`
Retrieves a paginated list of customers.

- **Auth**: Bearer Token required
- **Query Parameters**: `page` (default: 1), `limit` (default: 20), `search` (optional)
- **Response `200 OK`**:
  ```json
  {
    "success": true,
    "count": 42,
    "data": [
      {
        "id": 10,
        "company_name": "Automotive Systems Pvt Ltd",
        "contact_person": "Rahul Sharma",
        "email": "rahul.s@autosys.com",
        "phone": "+91 9876543210",
        "industry": "Manufacturing",
        "assigned_sales_rep": 1
      }
    ]
  }
  ```

### 2.2 `POST /api/customers`
Creates a new customer profile.

- **Auth**: Bearer Token required
- **Request Body**:
  ```json
  {
    "company_name": "Precision Engineering Corp",
    "contact_person": "Anita Roy",
    "email": "anita@precisioneng.com",
    "phone": "+91 9811223344",
    "industry": "Industrial Equipment"
  }
  ```
- **Response `201 Created`**:
  ```json
  {
    "success": true,
    "data": {
      "id": 11,
      "company_name": "Precision Engineering Corp",
      "created_at": "2026-07-31T23:55:00.000Z"
    }
  }
  ```

---

## 3. Product & Solutions Endpoints (`/api/products`)

### 3.1 `GET /api/products`
Retrieves products and total solutions catalog.

- **Auth**: Bearer Token required
- **Query Parameters**: `category` (optional), `application` (optional), `search` (optional)
- **Response `200 OK`**:
  ```json
  {
    "success": true,
    "data": [
      {
        "id": 101,
        "application": "Factory Automation",
        "category": "Sensors",
        "product_name": "Inductive Proximity Sensor",
        "make": "Bosch Rexroth",
        "model": "PRX-M12-04",
        "specification": "M12, 4mm PNP NO, IP67",
        "uom": "Pcs",
        "buying_price": 45.0,
        "list_price": 80.0,
        "discount": 10,
        "sales_price": 72.0,
        "sales_margin": 37.5,
        "product_image": "https://supabase.co/storage/v1/object/public/products/prx12.jpg"
      }
    ]
  }
  ```

### 3.2 `PUT /api/products/:id`
Updates product details or pricing parameters.

- **Auth**: Bearer Token required (Staff/Admin)
- **Request Body**:
  ```json
  {
    "buying_price": 48.0,
    "list_price": 85.0,
    "discount": 5,
    "sales_price": 80.75
  }
  ```
- **Response `200 OK`**:
  ```json
  {
    "success": true,
    "message": "Product price updated successfully",
    "updated_at": "2026-07-31T23:55:00.000Z"
  }
  ```

---

## 4. Sales & BOQ Endpoints (`/api/sales`)

### 4.1 `GET /api/sales/opportunities`
Retrieves sales opportunities in pipeline view.

- **Auth**: Bearer Token required
- **Response `200 OK`**:
  ```json
  {
    "success": true,
    "data": [
      {
        "id": 501,
        "title": "Smart Factory Sensor Upgrade",
        "customer_id": 10,
        "company_name": "Automotive Systems Pvt Ltd",
        "estimated_value": 150000.0,
        "stage": "Proposal Sent",
        "probability": 75,
        "target_close_date": "2026-08-30"
      }
    ]
  }
  ```

### 4.2 `POST /api/sales/boq`
Creates or updates BOQ line items for a quotation.

- **Auth**: Bearer Token required
- **Request Body**:
  ```json
  {
    "quotation_id": 201,
    "items": [
      {
        "product_id": 101,
        "quantity": 100,
        "unit_buying_price": 45.0,
        "unit_sales_price": 72.0
      }
    ]
  }
  ```
- **Response `200 OK`**:
  ```json
  {
    "success": true,
    "quotation_id": 201,
    "total_buying": 4500.0,
    "total_sales": 7200.0,
    "total_margin": 2700.0
  }
  ```

---

## 5. Report & Export Endpoints (`/api/reports`)

### 5.1 `GET /api/reports/dashboard`
Returns aggregated analytics metrics for dashboard widgets.

- **Auth**: Bearer Token required
- **Response `200 OK`**:
  ```json
  {
    "success": true,
    "kpis": {
      "total_pipeline_value": 1250000.0,
      "active_deals_count": 28,
      "open_quotations_count": 14,
      "win_rate_percentage": 64.2
    },
    "sales_trend": [
      { "month": "Jan", "amount": 120000 },
      { "month": "Feb", "amount": 180000 }
    ]
  }
  ```

### 5.2 `GET /api/reports/export/excel`
Streams an Excel (`.xlsx`) workbook containing filtered sales data.

- **Auth**: Bearer Token required
- **Query Parameters**: `startDate`, `endDate`, `category`
- **Response**: Binary stream (`Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`)

---

## 6. File Upload Endpoint (`/api/upload`)

### 6.1 `POST /api/upload`
Uploads a product image or quotation attachment to Supabase Storage.

- **Auth**: Bearer Token required
- **Content-Type**: `multipart/form-data`
- **Form Data**: `file` (binary blob), `folder` ("products" | "documents")
- **Response `200 OK`**:
  ```json
  {
    "success": true,
    "url": "https://supabase.co/storage/v1/object/public/products/sensor_img_123.jpg"
  }
  ```
