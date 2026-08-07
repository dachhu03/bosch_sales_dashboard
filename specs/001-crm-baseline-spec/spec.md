# Feature Specification: Bosch Sales CRM Baseline Specification

**Feature Branch**: `001-crm-baseline-spec`  
**Created**: 2026-07-31  
**Status**: Approved (Baseline)  
**Input**: User description: "Create a baseline Product Specification for the existing Bosch Sales CRM web application."

---

## Executive Summary & Business Goals

### Executive Summary
The **Bosch Sales CRM** is a centralized, full-stack Sales Management and Customer Relationship Management (CRM) web application. It serves as the primary operational portal for managing customer accounts, product catalogs, bill of quantities (BOQs), quotations, sales opportunities, executive analytics, and user access control. 

This specification establishes the official baseline documentation of the fully implemented and operational Bosch Sales CRM application. It defines existing system capabilities, workflows, data models, and component responsibilities to ensure all future enhancements are specified and built using Spec Kit without disrupting established business workflows.

### Business Goals
- **Centralized Pipeline Management**: Enable sales teams to track customer relationships, quotations, BOQs, and opportunities through a single integrated dashboard.
- **Accurate Quoting & Margins**: Streamline product pricing, buying vs. selling margins, and quotation generation for pre-sales and sales representatives.
- **Data-Driven Sales Decisions**: Provide real-time sales performance metrics, total solution breakdowns, and exportable business intelligence reports for management.
- **Operational Governance**: Maintain strict role-based access controls and secure data management across customer accounts and administrative settings.

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Sales Executive Pipeline & Quotation Management (Priority: P1)

Sales Representatives and Pre-sales Engineers need to manage sales opportunities from initial lead inquiry through quotation submission and status tracking so that deals progress predictably through the sales pipeline.

**Why this priority**: Core revenue-generating workflow; without quotation and pipeline management, the CRM cannot fulfill its primary pre-sales objective.

**Independent Test**: Can be tested by creating a customer opportunity, generating a quotation with line items and pricing margins, updating deal statuses (Draft, Sent, Won, Lost), and verifying status changes across the pipeline view.

**Acceptance Scenarios**:
1. **Given** an authenticated Sales Executive on the Sales Pipeline page, **When** they create a new opportunity associated with an existing Customer, **Then** the deal is registered in the pipeline in `Draft` status.
2. **Given** a deal in `Draft` status, **When** the Sales Executive attaches products/BOQ items with defined list price, discount, and sales price, **Then** the system calculates the sales margin and updates the total quotation value.
3. **Given** a finalized quotation, **When** the status is updated to `Sent` or `Won`, **Then** the dashboard KPIs reflect the updated pipeline total and conversion metrics.

---

### User Story 2 - Product & Solutions Catalog Browsing (Priority: P1)

Sales Engineers and Managers need to search, filter, and view products, total solution categories, unit of measures (UOM), and buying/sales prices so that accurate technical specifications and pricing are included in customer proposals.

**Why this priority**: Essential for accurate quoting, product margin control, and catalog management across total solutions.

**Independent Test**: Can be tested by searching the product catalog by category, viewing specification details, updating buying/list prices, and confirming updated price records.

**Acceptance Scenarios**:
1. **Given** a user navigating to the Product Management module, **When** they filter by category or search by product name/make/model, **Then** matching products with images, UOM, and list price are displayed.
2. **Given** an authorized user updating product pricing parameters, **When** buying price or sales margins are edited, **Then** the updated values and timestamp are saved to the database.

---

### User Story 3 - Customer Relationship & Account Management (Priority: P1)

Sales and Customer Success teams need to maintain comprehensive customer profile records, contact details, and historical engagement data.

**Why this priority**: Customer records form the foundational anchor for all opportunities, quotations, and sales reports.

**Independent Test**: Can be tested by adding a new customer, updating contact details, viewing customer activity, and deleting test customer records.

**Acceptance Scenarios**:
1. **Given** a Sales Executive on the Customer Management page, **When** they fill out and submit the Add Customer form, **Then** the customer record is created and listed in the customer directory.
2. **Given** an existing customer record, **When** a user clicks Customer Details, **Then** all associated opportunities, quotations, and contact information are accurately displayed.

---

### User Story 4 - Administrator Access & User Role Governance (Priority: P2)

System Administrators need to manage user accounts, assign staff/superuser roles, set active statuses, and configure application parameters so that security and access governance are maintained.

**Why this priority**: Critical for data security and controlling access to sensitive pricing, buying margins, and customer data.

**Independent Test**: Can be tested by creating user accounts, toggling staff/superuser privileges, attempting access under restricted roles, and verifying route protection.

**Acceptance Scenarios**:
1. **Given** an Administrator on the Administration module, **When** they create a new user account and assign roles/permissions, **Then** the user can log in with specified access privileges.
2. **Given** a non-admin user logged into the application, **When** they attempt to access `/admin` or administrative user settings, **Then** access is denied and they are redirected to the dashboard.

---

### User Story 5 - Executive Dashboard & Analytics Reporting (Priority: P2)

Sales Managers and Executives need real-time visualization of key performance indicators (KPIs), sales trend charts, and exportable Excel reports for executive review and operational planning.

**Why this priority**: Required for management visibility into pre-sales velocity, total solution sales volumes, and team performance.

**Independent Test**: Can be tested by viewing dashboard KPI cards, verifying chart rendering, and downloading Excel reports containing sales and customer data.

**Acceptance Scenarios**:
1. **Given** an authenticated user on the Dashboard overview, **When** new sales opportunities or status changes occur, **Then** total deal value, active pipeline count, and recent activity logs reflect the update.
2. **Given** a Sales Manager on the Reports page, **When** they select a date range and click Export Excel, **Then** a properly formatted `.xlsx` file containing detailed sales figures is generated and downloaded.

---

### Edge Cases

- **Session Expiration During Form Entry**: When a user's JWT token expires while filling out a quotation or customer form, the frontend detects a 401 Unauthorized response, preserves form state in memory where applicable, and redirects the user to the login screen.
- **Large Excel Report Generation**: When generating reports across large datasets, report creation streams asynchronously without freezing the frontend user interface.
- **Duplicate Customer/Product Records**: Unique constraints on usernames, customer identifiers, and product codes prevent accidental duplication with user-friendly inline validation errors.
- **Broken Image/Document Uploads**: Unsupported file extensions or uploads exceeding size limits return specific validation messages without corrupting file storage or database records.

---

## Requirements *(mandatory)*

### Functional Requirements

#### Authentication & Authorization
- **FR-001**: System MUST authenticate users via secure credentials (username/password) and issue JSON Web Tokens (JWT) for session management.
- **FR-002**: System MUST enforce protected route access on the frontend and authorization middleware on backend REST endpoints.
- **FR-003**: System MUST support secure user logout by invalidating client-side session tokens.

#### Dashboard & Analytics
- **FR-004**: System MUST display high-level KPI summary cards (e.g., Total Sales Volume, Active Pipeline Count, Open Quotations, Conversion Rate).
- **FR-005**: System MUST render interactive charts (line, bar, pie) illustrating sales trends and product category distributions.
- **FR-006**: System MUST present a real-time feed of recent sales activities and deal stage progressions.

#### Customer Management
- **FR-007**: System MUST provide full CRUD (Create, Read, Update, Delete) capabilities for customer profiles including company name, contact details, address, and status.
- **FR-008**: System MUST display detailed customer view pages listing associated sales opportunities, historical quotations, and communication logs.

#### Product Catalog & Total Solutions
- **FR-009**: System MUST manage product catalogs across categories, makes, models, specifications, UOM, and product images.
- **FR-010**: System MUST track buying prices, list prices, discounts, sales prices, and sales margins with timestamp tracking.

#### Sales Opportunities & Quotations
- **FR-011**: System MUST manage sales opportunities across defined pipeline stages (e.g., Prospecting, Proposal, Negotiation, Won, Lost).
- **FR-012**: System MUST allow users to construct Bill of Quantities (BOQ) and formal sales quotations linked to customers and products.
- **FR-013**: System MUST calculate line item subtotals, discount percentages, tax rates, and grand total prices automatically.

#### Reports & Document Export
- **FR-014**: System MUST generate custom sales and customer reports with configurable date range and category filters.
- **FR-015**: System MUST export report data to structured Excel spreadsheets (`.xlsx`) formatted for executive review.

#### File & Asset Management
- **FR-016**: System MUST support file upload capabilities for product images and quotation attachments using Supabase storage and local file handling.

#### System Administration
- **FR-017**: System MUST allow administrators to manage user accounts, assign roles (staff, superuser), toggle account activity status, and manage system preferences.

---

### Key Entities

- **User**: Represents application users (Sales Execs, Managers, Admins). Attributes include ID, username, email, password hash, staff flag, superuser flag, active status, last login, and date joined.
- **Customer**: Represents client companies and leads. Attributes include ID, company name, primary contact person, email, phone, industry category, address, created timestamp, and assigned sales representative.
- **Product / Solution Item**: Represents products and total solutions. Attributes include ID, application area, category, product name, make, model, specification, UOM, buying price, list price, discount %, sales price, sales margin %, vendor, lead time, product image URL, and updated timestamp.
- **Bill of Quantities (BOQ) / Quotation**: Represents commercial proposals sent to customers. Attributes include ID, quotation number, customer reference, line items, total buying cost, total sales price, net margin, status (Draft, Sent, Accepted, Rejected), creation date, and valid-until date.
- **Sales Opportunity**: Represents pipeline deals. Attributes include ID, deal title, customer reference, estimated value, stage/status, probability %, target close date, notes, and created date.

---

## Architecture & Responsibility Distribution

### Navigation Flow
```
[ Login Screen ] ---> ( Authentication Check )
                            |
                            v
                  [ Central Dashboard ]
                            |
       +--------------------+--------------------+--------------------+
       |                    |                    |                    |
[ Customers ]          [ Products ]           [ Sales ]          [ Reports ]
   |-- Directory          |-- Solutions Catalog  |-- Opportunities   |-- Dashboard Rpts
   |-- Add/Edit Customer  |-- Price & Margins    |-- BOQ & Quotes    |-- Excel Exports
   `-- Customer Details   `-- Specifications     `-- Pipeline Stages `-- Export Logs
                            |
                     [ Administration ] (Admin Only)
                        |-- User Governance
                        |-- Role Assignment
                        `-- System Settings
```

### Business Rules
- **Pricing & Margins**: Sales prices cannot fall below minimum margin thresholds without administrative approval.
- **Status Lifecycle**: Quotations cannot move directly from `Draft` to `Accepted` without moving through `Sent` verification.
- **Data Integrity**: Customer records with active linked opportunities cannot be hard-deleted; soft deletion or archiving is enforced.
- **Role Scoping**: Non-staff users can only access opportunities assigned to their team or account scope.

### Existing API Responsibilities
- **Auth Endpoint**: Validates login credentials, issues JWT tokens, handles password verification.
- **Customer API**: Serves customer lists, handles customer creation, updates, and relational lookups.
- **Product & Solution API**: Exposes product catalog searches, updates list prices, calculates margins, handles image association.
- **Sales & BOQ API**: Manages opportunity records, constructs BOQ items, calculates totals, updates deal stages.
- **Report & Export API**: Executes analytical database queries and streams `.xlsx` files using ExcelJS.
- **File Upload API**: Handles multi-part form data via Multer and persists file objects to Supabase storage.

### Frontend Responsibilities
- Render dynamic dashboard UI using React, Framer Motion, and Lucide React icons.
- Render interactive charts and data visualisations using Recharts.
- Manage application routing and protected views with React Router.
- Perform client-side input validation, error boundaries, and notifications.
- Execute HTTP requests to backend APIs using Axios with interceptors for JWT header attachment.

### Backend Responsibilities
- Node.js and Express server handling API routing, request validation, and response formatting.
- Execute database queries and schema management through Prisma ORM.
- Enforce JWT authentication and role-based access control middleware.
- Handle file upload streams using Multer and Supabase SDK integration.
- Generate structured binary Excel workbooks using ExcelJS.

### Database Responsibilities
- Persist relationally structured tables (`auth_user`, `exapp_totalsolutions`, `exapp_boq`, customer records, quotation records).
- Enforce referential integrity, primary/foreign key constraints, and unique indices.
- Support efficient indexed querying for search, filtering, and aggregated reporting.

### Existing Data Flow
```
[ User Input / UI ] 
       |
       v (Axios REST Request with JWT)
[ Express API Router & Auth Middleware ]
       |
       v (Business Logic & Validation)
[ Prisma ORM / Query Builder ]
       |
       v (SQL Queries)
[ PostgreSQL Database / Supabase Storage ]
       |
       v (Database Response)
[ Express JSON / Binary Streaming ]
       |
       v (State Update & Recharts Render)
[ React Frontend UI ]
```

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Page load times for the Central Dashboard render primary KPIs and charts in under 1.5 seconds under standard network conditions.
- **SC-002**: Sales Representatives can construct a standard quotation with line items and export to PDF/Excel in under 3 minutes.
- **SC-003**: System supports at least 200 concurrent active users without degradation in API response times (< 300ms average endpoint latency).
- **SC-004**: 100% of API endpoints enforcing authentication successfully reject unauthenticated requests with appropriate 401/403 status codes.
- **SC-005**: 100% of exported Excel reports contain accurate, uncorrupted totals matching database records.

---

## Constraints, Assumptions & Risks

### Constraints
- **Preserve Technology Stack**: Do not replace or modify the existing stack (React, Node.js, Express, Prisma ORM, PostgreSQL, Supabase).
- **Zero Workflow Disruption**: Do not alter established business logic, stage transitions, or operational flows.
- **Architecture Continuity**: Future feature modules must strictly integrate within the established frontend component hierarchy and backend REST middleware structure.

### Assumptions
- **Stable Database Connection**: The PostgreSQL database and Supabase storage instances are fully provisioned, accessible, and configured with appropriate permissions.
- **Standard Browser Support**: End users operate modern desktop web browsers (Chrome, Edge, Firefox, Safari) with JavaScript enabled.
- **Network Environment**: Users maintain continuous internet/intranet connectivity during session execution.

### Risks
- **Legacy Data Schema Mismatches**: Schema changes in future features must carefully maintain backward compatibility with existing raw SQL tables and Prisma models.
- **Large File Attachment Storage**: Increased volume of product images and BOQ document uploads could impact storage quotas if cleanup policies are not defined.

### Future Enhancement Areas
- **Advanced Approval Workflows**: Multi-tier manager approval for high-discount quotations.
- **Automated Email Notifications**: Real-time notifications for opportunity status changes and customer follow-up dates.
- **Enhanced Mobile Responsiveness**: Expanded touch-friendly layouts for mobile sales representatives in the field.
