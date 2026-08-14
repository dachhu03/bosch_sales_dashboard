# Phase 0 Research: BOQ Save Email Notification & Super Admin Review

## Architectural & Technical Decisions

### 1. Email Service & SMTP Transport
- **Decision**: Install `nodemailer` in `backend/` and construct a singleton SMTP transporter using environment variables (`SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASSWORD`, `EMAIL_FROM`).
- **Rationale**: `nodemailer` is the standard Node.js email library for Express backend services. Storing SMTP credentials strictly in backend environment variables (`backend/.env` for dev, Render environment variables for production) prevents credential leakage.
- **Alternatives Considered**: SendGrid / Mailgun API SDKs. Rejected to avoid third-party SDK lock-in when standard SMTP via Gmail App Password meets all requirements.

### 2. Request Deduplication via `event_id`
- **Decision**: Require frontend clients to submit a unique `event_id` (e.g., UUIDv4) with every `POST /api/boq/save` request. Add a unique index on `event_id` in the `notifications` database table.
- **Rationale**: Network retries or repeated save button clicks sharing the same `event_id` are caught by the unique database constraint, preventing duplicate email dispatches.
- **Alternatives Considered**: In-memory Redis deduplication. Rejected as over-engineering when Supabase PostgreSQL unique constraints provide instant, persistent deduplication.

### 3. Decoupled Asynchronous Notification Execution
- **Decision**: Complete the Supabase `exapp_boq` save transaction first. Immediately upon successful DB commit, queue/invoke the notification handler (`sendBoqSaveNotification(...)`). If SMTP dispatch fails, log the notification audit row with `status = 'FAILED'` and populate `error_message`, while preserving the committed BOQ data.
- **Rationale**: Prevents external SMTP latency or outages from delaying API responses or rolling back valid BOQ sales quotations.

### 4. Dynamic Super Admin Recipient Querying
- **Decision**: Query Super Admin accounts dynamically from `exapp_users` / Supabase (`is_superuser = 1` OR `role = 'super_admin'`) on the backend to determine notification recipients.
- **Rationale**: Keeps recipient resolution secure on the server side, preventing client-side header tampering or recipient hardcoding.

### 5. Schema Extensions & Migration Strategy
- **Decision**:
  - Add `review_status` (`VARCHAR(30)` default `'PENDING_REVIEW'`), `review_remarks` (`TEXT`), and `updated_at` (`TIMESTAMPTZ`) to `exapp_boq`.
  - Create table `notifications` with columns: `id` (bigserial primary key), `boq_id` (integer references `exapp_boq(id)`), `event_id` (varchar unique), `recipient` (text), `notification_type` (varchar), `status` (varchar: `'SENT'` or `'FAILED'`), `sent_at` (timestamptz), `created_at` (timestamptz default `now()`), `error_message` (text).
