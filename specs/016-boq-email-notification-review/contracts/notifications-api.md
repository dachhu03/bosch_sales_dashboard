# API Contract: BOQ Save Notifications & Super Admin Review

## Base URLs
- `/api/boq` (BOQ operations & save triggers)
- `/api/admin` (Super Admin notification panel & review management)

---

## 1. POST `/api/boq/save` (Updated with Deduplication Event ID)

Saves or updates a BOQ solution and triggers a background email notification to Super Admins.

### Authentication & Permissions
- **Authentication**: Required
- **Required Permission**: `boq:write` (Pre-Sales Admin, Price Admin, Super Admin)
- **Forbidden**: Viewer / Read-Only users (HTTP 403)

### Request Payload Extensions
```json
{
  "id": 14,
  "event_id": "c9bf9e57-1685-4c89-bafb-ff5af830be8a",
  "project_name": "BLR_18",
  "project_location": "Bangalore",
  "quotation_number": "A102",
  "approach": "si",
  "solution_title": "Bosch_02",
  "hardware": [],
  "software": [],
  "services": [],
  "amc": {},
  "totals": {}
}
```

### Success Response (200 OK)
```json
{
  "status": "success",
  "message": "BOQ saved successfully.",
  "data": {
    "id": 14,
    "event_id": "c9bf9e57-1685-4c89-bafb-ff5af830be8a"
  }
}
```

---

## 2. GET `/api/admin/notifications`

Fetch notification audit logs and pending BOQ review items for the Super Admin dashboard panel.

### Authentication & Permissions
- **Authentication**: Required
- **Required Role**: Super Admin (`is_superuser = 1` or `role = 'super_admin'`)

### Success Response (200 OK)
```json
{
  "status": "success",
  "data": {
    "notifications": [
      {
        "id": 101,
        "boqId": 14,
        "eventId": "c9bf9e57-1685-4c89-bafb-ff5af830be8a",
        "projectName": "BLR_18",
        "quotationNumber": "A102",
        "preparedBy": "Sales Lead",
        "recipient": "darshhgowda03@gmail.com",
        "notificationType": "BOQ_CREATED",
        "status": "SENT",
        "reviewStatus": "PENDING_REVIEW",
        "reviewRemarks": "",
        "sentAt": "2026-08-13T17:25:00.000Z",
        "createdAt": "2026-08-13T17:25:00.000Z",
        "errorMessage": null
      }
    ]
  }
}
```

---

## 3. PATCH `/api/admin/boq/:id/review`

Update the internal review status and review remarks for a specific BOQ.

### Authentication & Permissions
- **Authentication**: Required
- **Required Role**: Super Admin (`is_superuser = 1` or `role = 'super_admin'`)

### Request Body
```json
{
  "review_status": "APPROVED",
  "review_remarks": "Approved with technical discount justification."
}
```
*Allowed `review_status` Values*: `"PENDING_REVIEW"`, `"IN_REVIEW"`, `"APPROVED"`, `"REJECTED"`

### Success Response (200 OK)
```json
{
  "status": "success",
  "message": "BOQ review status updated successfully.",
  "data": {
    "id": 14,
    "reviewStatus": "APPROVED",
    "reviewRemarks": "Approved with technical discount justification."
  }
}
```
