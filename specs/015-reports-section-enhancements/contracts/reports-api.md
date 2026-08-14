# API Contract: Reports & Analytics Endpoints

## Base URL
`/api/reports` (or `/api/boq`)

---

## 1. GET `/api/reports/summary`

Fetch optimized quotation projections and pre-aggregated metrics for the Reports section dashboard.

### Authentication & Permissions
- **Authentication**: Required (Session Cookie or JWT Header)
- **Required Permission**: `reports:read`

### Query Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `year` | string/integer | Optional | Filter by creation year (e.g., `2026`) |
| `month` | string/integer | Optional | Filter by creation month (`1` to `12`) |
| `status` | string | Optional | Filter by status (`Closed`, `In Review`, `Rejected`) |
| `approach` | string | Optional | Filter by channel (`si`, `direct`) |

### Success Response (200 OK)
```json
{
  "status": "success",
  "data": {
    "summaryMetrics": {
      "totalQuotesCount": 15,
      "totalQuotedSales": 3450000.50,
      "totalProfit": 690000.10,
      "overallMarginPercent": 20.0,
      "statusCounts": {
        "closed": 7,
        "inReview": 5,
        "rejected": 3
      }
    },
    "quotations": [
      {
        "id": 14,
        "projectName": "BLR_18",
        "projectLocation": "Bangalore",
        "quotationNumber": "A102",
        "approach": "si",
        "solutionTitle": "Bosch_02",
        "preparedBy": "Sales Lead",
        "status": "In Review",
        "remarks": "Under evaluation by client procurement team",
        "salesTotal": 159880.50,
        "buyTotal": 130500.00,
        "profitTotal": 29380.50,
        "marginPercentage": 18.4,
        "createdAt": "2026-05-15T04:30:03.734Z"
      }
    ]
  }
}
```

---

## 2. PATCH `/api/reports/:id/status`

Update the status of a specific quotation.

### Authentication & Permissions
- **Authentication**: Required
- **Required Role/Permission**: Super Admin or `boq:write`

### Request Body
```json
{
  "status": "Closed"
}
```
*Allowed Status Values*: `"Closed"`, `"In Review"`, `"Rejected"`

### Success Response (200 OK)
```json
{
  "status": "success",
  "message": "Quotation status updated successfully.",
  "data": {
    "id": 14,
    "status": "Closed"
  }
}
```

---

## 3. PATCH `/api/reports/:id/remarks`

Update the notes/remarks for a specific quotation.

### Authentication & Permissions
- **Authentication**: Required
- **Required Role/Permission**: Super Admin or `boq:write` or `reports:read`

### Request Body
```json
{
  "remarks": "Quotation declined due to budget constraints. Follow up in Q4."
}
```

### Success Response (200 OK)
```json
{
  "status": "success",
  "message": "Quotation remarks updated successfully.",
  "data": {
    "id": 14,
    "remarks": "Quotation declined due to budget constraints. Follow up in Q4."
  }
}
```
