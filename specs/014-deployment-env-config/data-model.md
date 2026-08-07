# Data Model & Configuration Schema: Deployment Environment Configuration Update

**Feature**: Deployment Environment Configuration Update
**Date**: 2026-08-07
**Spec**: [spec.md](./spec.md) | **Plan**: [plan.md](./plan.md)

## 1. Environment Variable Schema

### Frontend Environment Variables (`frontend/.env`)

| Variable | Type | Default (Local) | Production (Vercel) | Description |
|----------|------|-----------------|---------------------|-------------|
| `VITE_API_URL` | `string` | `http://localhost:5000/api` | `https://bosch-sales-dashboard.onrender.com/api` | Target backend REST API endpoint |
| `VITE_SUPABASE_URL` | `string` | Supabase Project URL | Supabase Project URL | Supabase client project URL |
| `VITE_SUPABASE_ANON_KEY` | `string` | Supabase Anon Key | Supabase Anon Key | Supabase anonymous API key |

### Backend Environment Variables (`backend/.env`)

| Variable | Type | Default (Local) | Production (Render) | Description |
|----------|------|-----------------|---------------------|-------------|
| `PORT` | `number` | `5000` | Process Port (assigned by Render) | Server listener port |
| `FRONTEND_URL` | `string` | `http://localhost:5173` | `https://bosch-sales-dashboard.vercel.app` | Allowed CORS frontend origin(s) |
| `SUPABASE_URL` | `string` | Supabase Project URL | Supabase Project URL | Backend Supabase database URL |
| `SUPABASE_ANON_KEY` | `string` | Supabase Anon Key | Supabase Anon Key | Backend Supabase API key |
| `JWT_SECRET` | `string` | JWT Secret Key | JWT Secret Key | Token signature secret key |
| `NODE_ENV` | `string` | `development` | `production` | Active runtime environment |

---

## 2. API Helper Contract (`frontend/src/utils/api.js`)

```typescript
interface ApiConfig {
  apiBaseUrl: string;       // e.g. "https://bosch-sales-dashboard.onrender.com/api"
  backendOrigin: string;    // e.g. "https://bosch-sales-dashboard.onrender.com"
  getMediaUrl: (relativePath: string) => string;
}
```
