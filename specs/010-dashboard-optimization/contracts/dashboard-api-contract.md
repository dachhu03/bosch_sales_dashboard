# Interface Contract: Dashboard Metrics & Profit Margin API

**Feature**: `010-dashboard-optimization`  
**Contract Type**: REST API Response Contract

## Endpoint: `GET /api/dashboard/metrics` (or `/api/quotes/margins`)

### Response Format (`200 OK`)

```json
{
  "status": "success",
  "data": {
    "categoryBreakdown": [
      { "category": "Software", "count": 14, "color": "#008ecf" },
      { "category": "Hardware", "count": 28, "color": "#f43f5e" },
      { "category": "Service", "count": 9, "color": "#10b981" }
    ],
    "quoteProfitMargins": [
      {
        "id": "Q-2026-001",
        "quoteName": "Smart Factory Phase 1",
        "totalSellingPrice": 150000,
        "totalCost": 105000,
        "profitMarginPercentage": 30.0
      },
      {
        "id": "Q-2026-002",
        "quoteName": "Building Security System",
        "totalSellingPrice": 82000,
        "totalCost": 68000,
        "profitMarginPercentage": 17.1
      }
    ]
  }
}
```
