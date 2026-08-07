# Architectural Research & Technical Analysis: Bosch Sales CRM Baseline

**Feature**: [spec.md](file:///D:/newUser/Pre-sales-CRM/bosch_sales_dashboard/specs/001-crm-baseline-spec/spec.md) | **Plan**: [plan.md](file:///D:/newUser/Pre-sales-CRM/bosch_sales_dashboard/specs/001-crm-baseline-spec/plan.md)  
**Date**: 2026-07-31  

---

## 1. Database Data Access Strategy

### Decision
Utilize **Prisma ORM** as the primary data access layer connecting Node.js/Express to the PostgreSQL database, maintaining exact model alignment with `supabase_schema.sql` tables (`auth_user`, `exapp_totalsolutions`, `exapp_boq`, customer records, quotation records).

### Rationale
- **Type Safety & Auto-completion**: Prisma provides strongly typed client queries for Node.js, reducing runtime SQL syntax errors.
- **Schema Synchronization**: Simplifies schema introspection and migrations while respecting existing database structures.
- **Query Performance**: Generates optimized SQL queries with eager/lazy loading of relation models (e.g., Quotations with BOQ line items).

### Alternatives Considered
- *Raw SQL Queries (`pg` module)*: Rejected due to maintenance overhead, manual mapping of SQL result rows to JS objects, and higher risk of SQL injection vulnerabilities.
- *TypeORM / Sequelize*: Rejected to maintain strict continuity with the pre-existing codebase architecture.

---

## 2. Authentication & Authorization Architecture

### Decision
Implement stateless **JSON Web Token (JWT)** authentication delivered via HTTP `Authorization: Bearer <token>` headers, paired with Express authorization middleware for role-based access control (Staff vs. Superuser).

### Rationale
- **Stateless Verification**: Allows horizontally scalable API requests without requiring server-side session stores.
- **Role Enforcement**: Middlewares (`verifyToken`, `requireStaff`, `requireSuperuser`) easily inspect payload claims to restrict administrative routes.
- **Frontend Interception**: Axios interceptors handle automatic header injection and single-point 401 redirection.

### Alternatives Considered
- *Session Cookies (Express-Session)*: Rejected due to cross-origin credential handling complexity and stateful memory overhead.
- *Third-party Auth (Auth0/Firebase Auth)*: Rejected because user accounts are directly managed in the PostgreSQL database matching Django `auth_user` schema conventions.

---

## 3. File & Image Storage Processing

### Decision
Use **Multer** for multipart form data handling in Express endpoints, combined with **Supabase Storage SDK** for object persistence and public asset URL generation.

### Rationale
- **Cloud Bucket Persistence**: Keeps local server disk stateless while storing product catalog images and BOQ documents reliably in Supabase buckets.
- **Multer Memory Storage**: Passes file buffers directly from request streams to Supabase without temporary disk writes.

### Alternatives Considered
- *Local Disk Storage (`/uploads` directory)*: Rejected due to scalability limitations in cloud deployment environments.
- *AWS S3 SDK*: Rejected to leverage existing Supabase infrastructure already integrated into the project.

---

## 4. Excel Report Generation Engine

### Decision
Utilize **ExcelJS** on the backend to construct binary `.xlsx` workbooks dynamically and stream them to the client via HTTP response headers.

### Rationale
- **Rich Formatting**: Supports cell styling, headers, custom column widths, formula calculations, and multiple worksheets.
- **Stream Efficiency**: Allows memory-efficient streaming of report data directly to `res` write streams.

### Alternatives Considered
- *Client-side CSV Export (`xlsx` / `papaparse`)*: Rejected because complex multi-tab reports with custom cell formatting require server-side template generation.
- *PDF-only Export*: Rejected because pre-sales managers require raw spreadsheet data for financial modeling.

---

## 5. UI Component & Visualization Framework

### Decision
Combine **React 18** with **Recharts** for analytics visualization, **Framer Motion** for smooth page transitions, and **Lucide React** for consistent icon iconography.

### Rationale
- **Declarative Charts**: Recharts provides responsive SVG-based charts (Line, Bar, Pie) tailored for sales dashboards.
- **UX Motion**: Framer Motion enhances perceived performance with micro-interactions without cluttering component logic.
- **Component Reusability**: Modular UI structure (Cards, Data Tables, Modals, Forms) maintains high UI polish and maintainability.

### Alternatives Considered
- *Chart.js*: Rejected due to canvas-based rendering limitations when integrating with responsive CSS layouts.
- *TailwindCSS*: Kept to Vanilla CSS / CSS Modules per project architecture guidelines.
