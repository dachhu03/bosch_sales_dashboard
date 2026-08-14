# Feature Specification: BOQ Save Email Notification & Super Admin Review

**Feature Branch**: `016-boq-email-notification-review`

**Created**: 2026-08-13

**Status**: Draft

**Input**: User description: "Add a notification feature where every successful BOQ/Solution save sends an email to the Super Admin. Super Admin, Pre-Sales Admin, Price Admin can create/update BOQs triggering emails. Read-only users cannot save or trigger emails. Every intentional save triggers an email with a unique event_id to prevent duplicates. Database requires review_status (PENDING_REVIEW, IN_REVIEW, APPROVED, REJECTED), review_remarks, and updated_at on BOQ, plus a notifications log table. Nodemailer with Gmail SMTP for app 'Bosch Sales Dashboard'. Super Admin dashboard requires a notification panel to review BOQs, update internal review status, and add remarks separate from customer status. BOQ save failures must not send email; email send failure keeps BOQ saved but logs notification status as FAILED."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Automated BOQ Save Email Notification (Priority: P1) 🎯 MVP

As a Super Admin user, I want to automatically receive an email notification whenever an authorized user (Pre-Sales Admin, Price Admin, or Super Admin) successfully creates or updates a BOQ/Solution quote so that I am immediately alerted when a proposal requires management review.

**Why this priority**: Immediate management notification ensures timely review of high-value pre-sales quotes and prevents unreviewed proposals from stalling in the pipeline.

**Independent Test**: Can be tested by logging in as a Pre-Sales Admin or Price Admin, saving a new or existing BOQ proposal, and verifying that an email is dispatched to Super Admin users with project details, creator name, quotation number, and a direct review link, while an entry is recorded in the notifications audit log.

**Acceptance Scenarios**:

1. **Given** an authorized user creating a new BOQ quote, **When** the user clicks Save and the proposal is committed to the database, **Then** an email with subject "New BOQ Created - Review Required" is dispatched to Super Admin users containing Project Name, Customer, Quotation Number, Creator Name, Date, Review Status ("PENDING_REVIEW"), and a direct link to the review workspace.
2. **Given** an authorized user updating an existing BOQ quote, **When** the update is saved successfully, **Then** an email with subject "BOQ Updated - Review Required" is dispatched to Super Admin users with updated metadata.
3. **Given** a BOQ save operation that encounters a database error or validation failure, **When** the save fails, **Then** no email notification is dispatched.
4. **Given** a network retry or rapid button click generating duplicate save requests with the same client `event_id`, **When** processed by the backend, **Then** only one email notification is sent, preventing duplicate inbox spam.

---

### User Story 2 - Super Admin Review Panel & Internal Status Management (Priority: P2)

As a Super Admin, I want a dedicated notification and review panel in my dashboard so that I can inspect newly submitted or updated BOQs, assign internal review statuses (`PENDING_REVIEW`, `IN_REVIEW`, `APPROVED`, `REJECTED`), and record internal review remarks independently of customer-facing proposal statuses.

**Why this priority**: Super Admins require a centralized workflow to evaluate technical/commercial solutions, record internal feedback or approval notes, and track internal sign-offs before external customer submission.

**Independent Test**: Can be tested by opening the Super Admin notification panel, selecting a pending BOQ, updating its review status to "APPROVED" or "REJECTED" with review notes, saving, and confirming that internal review metadata persists independently without corrupting customer quotation statuses.

**Acceptance Scenarios**:

1. **Given** a Super Admin accessing the notification panel, **When** reviewing the list of BOQ save events, **Then** the panel displays recent notifications, creator details, timestamp, review status badge, and email delivery status (`SENT` or `FAILED`).
2. **Given** a Super Admin inspecting a specific BOQ, **When** the admin selects a review status (`IN_REVIEW`, `APPROVED`, or `REJECTED`) and enters internal review remarks, **Then** the review status and remarks are saved and displayed on subsequent views.
3. **Given** internal review status changes, **When** updated by Super Admin, **Then** the customer-facing quotation status (`Closed`, `In Review`, `Rejected`) remains unaffected, maintaining clear separation between internal sign-offs and customer deal states.

---

### User Story 3 - RBAC Security & Notification Failure Resilience (Priority: P3)

As a system administrator, I want backend RBAC enforcement and robust error handling so that unauthorized users (Viewer / Read-Only) cannot save BOQs or trigger emails, and SMTP transport failures do not roll back successful BOQ data saves.

**Why this priority**: System integrity requires strict permission boundaries to prevent unauthorized mutations, while decoupled email failure handling ensures core pre-sales quote data is never lost due to external SMTP server outages.

**Independent Test**: Can be tested by attempting a BOQ save request with a Read-Only user token (verifying HTTP 403 Forbidden rejection and zero emails sent), and simulating an SMTP transport error (verifying BOQ save succeeds while notification audit record is logged with status `FAILED` and error message).

**Acceptance Scenarios**:

1. **Given** a Read-Only (Viewer) user, **When** attempting to invoke BOQ save or review endpoints, **Then** the backend rejects the request with HTTP 403 Forbidden and no email is sent.
2. **Given** a successful BOQ save where Gmail SMTP service is temporarily unreachable, **When** the email dispatch fails, **Then** the BOQ save remains committed to Supabase, and a notification audit record is created with status `FAILED` and error details logged for troubleshooting.

---

### Edge Cases

- **Multiple Super Admins**: What happens if the system has multiple Super Admin accounts? (Backend MUST dynamically query all active Super Admin emails and send notifications to all eligible Super Admins).
- **SMTP Credential Expiry / Outage**: How does the system handle invalid Google App Passwords or SMTP rate limits? (System MUST log exact error messages into the `notifications` table error column without crashing the backend server or blocking user UI interactions).
- **Rapid Retries / Duplicate Event IDs**: What happens when an unstable client connection sends identical save requests within seconds? (System MUST enforce database unique constraints on `event_id` in the `notifications` table, silently ignoring duplicate notification triggers).
- **Simultaneous Review Updates**: What happens if two Super Admins review the same BOQ concurrently? (System MUST record the latest valid review status update with timestamp and update author details).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST automatically dispatch an email notification to all active Super Admin accounts immediately following every successful BOQ creation or update.
- **FR-002**: System MUST include a unique client-generated `event_id` with each save payload and enforce event deduplication in the notification system to prevent duplicate email dispatches.
- **FR-003**: System MUST track internal review state for each BOQ using standard statuses: `PENDING_REVIEW`, `IN_REVIEW`, `APPROVED`, and `REJECTED`.
- **FR-004**: System MUST maintain a dedicated `notifications` audit log table in the database recording `id`, `boq_id`, `event_id`, `recipient`, `notification_type`, `status` (`SENT` or `FAILED`), `sent_at`, `created_at`, and `error_message`.
- **FR-005**: System MUST configure backend email transport using Nodemailer and Gmail SMTP, securing credentials exclusively in backend environment variables (`SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`, `EMAIL_FROM`).
- **FR-006**: System MUST format email subjects as "New BOQ Created - Review Required" (for insertions) or "BOQ Updated - Review Required" (for updates), with email body detailing Project Name, Customer, Quotation Number, Creator Name, Date, Review Status, and a direct application link.
- **FR-007**: System MUST provide a Super Admin Review & Notification Panel in the UI allowing Super Admins to inspect notifications, review solution details, update internal review status, and save internal review remarks.
- **FR-008**: System MUST maintain strict decoupling between internal review status (`PENDING_REVIEW`, `IN_REVIEW`, `APPROVED`, `REJECTED`) and customer-facing quotation status (`Closed`, `In Review`, `Rejected`).
- **FR-009**: System MUST enforce server-side RBAC validation ensuring only authorized roles (Super Admin, Pre-Sales Admin, Price Admin) can execute BOQ saves and trigger notifications, while Read-Only users are blocked with HTTP 403 Forbidden.
- **FR-010**: System MUST isolate email dispatch logic so that an email transport failure does not roll back or fail a successful BOQ database save.
- **FR-011**: System MUST strictly preserve all existing features (Auth, RBAC, BOQ Generator, Reports section, Product Catalog, Vercel/Render deployment) without introducing regression errors.

### Key Entities *(include if feature involves data)*

- **BOQ Review Extension**: Extends the `exapp_boq` table with `review_status` (`PENDING_REVIEW`, `IN_REVIEW`, `APPROVED`, `REJECTED`), `review_remarks` (text feedback), and `updated_at` (timestamp).
- **Notification Audit Entry**: Represents a logged notification event in table `notifications` containing `id`, `boq_id`, `event_id`, `recipient`, `notification_type` (`BOQ_CREATED`, `BOQ_UPDATED`), `status` (`SENT`, `FAILED`), `sent_at`, `created_at`, and `error_message`.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of successful BOQ saves by authorized users trigger an email dispatch attempt to Super Admin users within 3 seconds of database commit.
- **SC-002**: 0 duplicate emails sent for duplicate requests sharing the same `event_id`.
- **SC-003**: 100% of email dispatches (both successful `SENT` and failed `FAILED`) are accurately recorded in the `notifications` audit table.
- **SC-004**: 100% of Read-Only user save attempts are rejected with HTTP 403 Forbidden without triggering emails.
- **SC-005**: 0 BOQ save rollbacks caused by email server outages or SMTP transport errors.
- **SC-006**: 0 regression errors introduced into existing BOQ calculation engine, Reports section, Product Catalog, or RBAC modules.

## Assumptions

- Super Admin user email addresses are stored in the user database (`users` / `exapp_users` table) and can be queried dynamically by backend services.
- Gmail SMTP credentials (`SMTP_USER` and `SMTP_PASSWORD` app password) are configured in `backend/.env` for local testing and added to Render environment variables for production.
- Front-end applications pass a unique UUID `event_id` in the BOQ save request payload.
