# Data Model & Schema Definition: Bosch Sales CRM Baseline

**Feature**: [spec.md](file:///D:/newUser/Pre-sales-CRM/bosch_sales_dashboard/specs/001-crm-baseline-spec/spec.md) | **Plan**: [plan.md](file:///D:/newUser/Pre-sales-CRM/bosch_sales_dashboard/specs/001-crm-baseline-spec/plan.md)  
**Date**: 2026-07-31  

---

## 1. Entity Relationship Overview

```
 [ auth_user ] (1) <------- (N) [ Customer ] (1) <------- (N) [ Opportunity ]
       |                                                            |
       | (1)                                                        v (1)
       v (N)                                                 [ Quotation ]
 [ User Session ]                                                   |
                                                                    v (N)
 [ exapp_totalsolutions ] (1) <--------------------------------- [ exapp_boq ]
 (Products & Margins)                                            (Line Items)
```

---

## 2. Core Entity Definitions

### 2.1 `User` (`auth_user`)
Represents application users (Sales Executives, Pre-sales Engineers, Managers, System Admins).

| Field Name | Type | Constraints | Description |
|------------|------|-------------|-------------|
| `id` | Integer / Serial | Primary Key, Auto-increment | Unique user identifier |
| `username` | String (150) | Unique, Not Null | Account login username |
| `password` | String (128) | Not Null | Hashed password string |
| `first_name` | String (150) | Nullable | User's first name |
| `last_name` | String (150) | Nullable | User's last name |
| `email` | String (254) | Nullable | Contact email address |
| `is_staff` | SmallInt | Default: 0 | Flag indicating staff access |
| `is_superuser` | SmallInt | Default: 0 | Flag indicating administrator access |
| `is_active` | SmallInt | Default: 1 | Flag indicating account activity status |
| `last_login` | Timestamp TZ | Nullable | Last authentication timestamp |
| `date_joined` | Timestamp TZ | Default: NOW(), Not Null | Account creation timestamp |

---

### 2.2 `ProductSolution` (`exapp_totalsolutions`)
Represents products, components, total solution offerings, pricing parameters, and margins.

| Field Name | Type | Constraints | Description |
|------------|------|-------------|-------------|
| `id` | BigInt / BigSerial | Primary Key, Auto-increment | Unique solution product identifier |
| `application` | String (255) | Not Null | Target application area / sector |
| `category` | String (50) | Not Null | Product category classification |
| `product_name` | String (255) | Not Null | Descriptive product name |
| `make` | String (255) | Nullable | Manufacturer / Brand name |
| `model` | String (255) | Nullable | Model number / designation |
| `specification` | Text | Nullable | Technical spec description |
| `uom` | String (300) | Not Null | Unit of Measure (e.g., Set, Pcs, Meter) |
| `buying_price` | Float (Double) | Default: 0.0, Not Null | Unit procurement/buying price |
| `vendor` | String (255) | Nullable | Vendor / Supplier name |
| `quotation_received_month` | Date | Nullable | Vendor quote reference month |
| `lead_time` | String (50) | Nullable | Delivery lead time estimate |
| `remarks` | Text | Nullable | Internal notes & comments |
| `list_price` | Float (Double) | Default: 0.0, Not Null | Standard catalog list price |
| `discount` | Integer | Default: 0, Not Null | Standard discount percentage |
| `sales_price` | Float (Double) | Default: 0.0, Not Null | Calculated selling price |
| `sales_margin` | Integer | Default: 0, Not Null | Calculated profit margin percentage |
| `buying_price_updated_at` | Timestamp TZ | Nullable | Pricing update timestamp |
| `product_image` | String (100) | Nullable | Relative path / URL to image asset |

---

### 2.3 `BillOfQuantities` (`exapp_boq`)
Represents line items embedded within customer quotations.

| Field Name | Type | Constraints | Description |
|------------|------|-------------|-------------|
| `id` | BigInt / BigSerial | Primary Key, Auto-increment | Unique BOQ line item identifier |
| `quotation_id` | Foreign Key | References `Quotation.id` | Associated quotation ID |
| `product_id` | Foreign Key | References `exapp_totalsolutions.id` | Linked catalog product |
| `quantity` | Integer | Not Null, Min: 1 | Item quantity count |
| `unit_buying_price` | Float | Not Null | Buying price per unit |
| `unit_sales_price` | Float | Not Null | Selling price per unit |
| `line_total_buying` | Float | Calculated | `quantity * unit_buying_price` |
| `line_total_sales` | Float | Calculated | `quantity * unit_sales_price` |
| `line_margin` | Float | Calculated | Line item net margin amount |

---

### 2.4 `Customer`
Represents client organizations, contacts, and leads.

| Field Name | Type | Constraints | Description |
|------------|------|-------------|-------------|
| `id` | BigInt | Primary Key, Auto-increment | Unique customer identifier |
| `company_name` | String (255) | Not Null | Client company name |
| `contact_person` | String (150) | Not Null | Primary contact name |
| `email` | String (254) | Not Null | Primary contact email |
| `phone` | String (50) | Nullable | Phone number |
| `industry` | String (100) | Nullable | Business sector / industry |
| `address` | Text | Nullable | Company address |
| `created_at` | Timestamp TZ | Default: NOW() | Registration date |
| `assigned_sales_rep` | Foreign Key | References `auth_user.id` | Sales Executive owner |

---

### 2.5 `SalesOpportunity`
Represents pipeline deals tracked across sales stages.

| Field Name | Type | Constraints | Description |
|------------|------|-------------|-------------|
| `id` | BigInt | Primary Key, Auto-increment | Unique deal identifier |
| `title` | String (255) | Not Null | Deal opportunity name |
| `customer_id` | Foreign Key | References `Customer.id` | Linked customer account |
| `estimated_value` | Float | Default: 0.0 | Total opportunity value |
| `stage` | String (50) | Enum (below) | Pipeline stage |
| `probability` | Integer | Min: 0, Max: 100 | Win probability percentage |
| `target_close_date` | Date | Nullable | Expected deal closure date |
| `created_at` | Timestamp TZ | Default: NOW() | Record creation date |

---

## 3. State Transitions & Lifecycles

### 3.1 Sales Opportunity Stage Progression
```
[ Prospecting ] ---> [ Proposal Sent ] ---> [ Negotiation ] ---> [ Won ]
          |                  |                    |
          +------------------+--------------------+------------> [ Lost ]
```

### 3.2 Quotation Status Lifecycle
```
[ Draft ] ---> [ Sent to Customer ] ---> [ Accepted ]
    |                    |
    `--------------------+-------------> [ Rejected ]
```
- **Validation Rules**:
  - `Draft` → `Sent`: Requires all BOQ line items to have `quantity > 0` and non-negative `sales_price`.
  - `Sent` → `Accepted`: Updates associated `SalesOpportunity` stage to `Won`.
  - `Sent` → `Rejected`: Requires reason for rejection entry.
