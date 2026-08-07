# API Contract: Report Optimization & Solution Management

## Overview
This document defines the HTTP API contract between the React frontend (`Reports.jsx`, `BOQGenerator.jsx`) and Node/Express backend (`backend/routes/boq.js`).

---

## 1. GET `/api/boq/list`

Retrieves all saved BOQ quotes with report metadata, approach type, prepared by attribution, approval status, and usage counts.

### Request
- **Headers**: `Authorization: Bearer <token>`

### Response (`200 OK`)
```json
{
  "status": "success",
  "data": {
    "boqs": [
      {
        "id": 8,
        "projectName": "City Mall Surveillance",
        "projectLocation": "Mumbai",
        "quotationNumber": "BOSCH-2026-008",
        "approach": "si",
        "budget": "high-end",
        "solutionTitle": "IP Video Surveillance Solution",
        "preparedBy": "John Sales",
        "approvalStatus": "Approved",
        "usageCount": 14,
        "isPriority": true,
        "totals": {
          "grandTotalSales": 12500000.00,
          "grandTotalBuy": 9800000.00,
          "marginPercentage": 21.6
        },
        "createdAt": "2026-08-01T10:30:00.000Z"
      }
    ]
  }
}
```

---

## 2. GET `/api/boq/:id`

Retrieves complete line item data and metadata for a specific BOQ to populate the BOQ Generator.

### Request
- **Headers**: `Authorization: Bearer <token>`
- **Path Parameter**: `id` (integer)

### Response (`200 OK`)
```json
{
  "status": "success",
  "data": {
    "boq": {
      "id": 8,
      "projectName": "City Mall Surveillance",
      "projectLocation": "Mumbai",
      "quotationNumber": "BOSCH-2026-008",
      "approach": "si",
      "budget": "high-end",
      "solutionTitle": "IP Video Surveillance Solution",
      "preparedBy": "John Sales",
      "approvalStatus": "Approved",
      "usageCount": 15,
      "hardware": [ ... ],
      "software": [ ... ],
      "services": [ ... ],
      "amc": { ... },
      "totals": { ... }
    }
  }
}
```

---

## 3. DELETE `/api/boq/:id`

Deletes a specific BOQ solution record.

### Request
- **Headers**: `Authorization: Bearer <token>`
- **Path Parameter**: `id` (integer)

### Response (`200 OK`)
```json
{
  "status": "success",
  "message": "BOQ solution deleted successfully.",
  "data": {
    "id": 8
  }
}
```

### Errors
- `404 Not Found`: `{ "status": "error", "message": "BOQ quote not found." }`
- `500 Internal Error`: `{ "status": "error", "message": "Failed to delete BOQ quote." }`

---

## 4. POST `/api/boq/:id/increment-usage`

Increments the `usage_count` for a solution when selected/loaded into the BOQ Generator.

### Request
- **Headers**: `Authorization: Bearer <token>`
- **Path Parameter**: `id` (integer)

### Response (`200 OK`)
```json
{
  "status": "success",
  "data": {
    "id": 8,
    "usageCount": 15
  }
}
```
