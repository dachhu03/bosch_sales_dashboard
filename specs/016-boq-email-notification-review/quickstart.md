# Quickstart & End-to-End Validation Guide

**Feature**: BOQ Save Email Notification & Super Admin Review  
**Branch**: `016-boq-email-notification-review`  
**Reference Contracts**: [`contracts/notifications-api.md`](contracts/notifications-api.md) | **Data Model**: [`data-model.md`](data-model.md)

---

## Prerequisites & Environment Setup

1. Node.js (v18+) and npm installed.
2. `nodemailer` installed in `backend/`.
3. Backend `.env` configured with SMTP credentials:
   ```env
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_SECURE=false
   SMTP_USER=darshhgowda03@gmail.com
   SMTP_PASSWORD=fudu icuc mtim xtbi
   EMAIL_FROM=darshhgowda03@gmail.com
   ```
4. Supabase PostgreSQL database tables updated with extension columns (`review_status`, `review_remarks`, `updated_at` on `exapp_boq`) and new table `notifications`.

---

## End-to-End Test Scenarios

### Scenario 1: Authorized BOQ Save Triggers Super Admin Email Notification
1. Login as Pre-Sales Admin or Price Admin (`/login`).
2. Navigate to BOQ Generator (`/boq`). Fill project name, quotation number, and add product line items.
3. Click **Save BOQ**.
4. **Validation Outcome**:
   - BOQ saves successfully to Supabase.
   - An email is received by Super Admin (`darshhgowda03@gmail.com`) with subject `"New BOQ Created - Review Required"` containing project details, creator, quotation number, and a direct review link.
   - Database table `notifications` records an audit row with `status = 'SENT'` and unique `event_id`.

---

### Scenario 2: Deduplication Protection on Retried Save Requests
1. Trigger a save request containing an identical `event_id` payload.
2. **Validation Outcome**:
   - The system commits the database save or recognizes the duplicate `event_id`.
   - No second email is dispatched to Super Admin, preventing duplicate inbox dispatches.

---

### Scenario 3: Super Admin Notification Panel & Review Management
1. Login as Super Admin user.
2. Navigate to Admin Dashboard (`/admin`).
3. Locate the **BOQ Notifications & Review Panel**.
4. Select the newly saved BOQ, click **Review**, update review status to **APPROVED** or **REJECTED**, enter review remarks (e.g., `"Technical solution verified and approved"`), and click **Save Review**.
5. **Validation Outcome**:
   - Review status updates to `APPROVED` / `REJECTED` and remarks persist in the database.
   - The customer-facing quotation status (`Closed`, `In Review`, `Rejected`) remains untouched.

---

### Scenario 4: Notification Failure Isolation
1. Temporarily configure an invalid `SMTP_PASSWORD` in `backend/.env`.
2. Save a BOQ quote as an authorized user.
3. **Validation Outcome**:
   - The BOQ quote is saved successfully in Supabase (`exapp_boq`).
   - The notification audit record is logged with `status = 'FAILED'` and error message captured in database.
   - User UI receives a successful BOQ save confirmation without application crashes.

---

### Scenario 5: Read-Only Authorization Rejection
1. Login as a Read-Only (Viewer) user.
2. Attempt to save a BOQ or update review status.
3. **Validation Outcome**:
   - Request is blocked by backend RBAC with HTTP 403 Forbidden.
   - No email is dispatched.
