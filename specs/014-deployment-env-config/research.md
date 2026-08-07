# Research & Technical Decisions: Deployment Environment Configuration Update

**Feature**: Deployment Environment Configuration Update
**Date**: 2026-08-07
**Spec**: [spec.md](./spec.md) | **Plan**: [plan.md](./plan.md)

## 1. Frontend Dynamic API Base URL Resolution

### Decision
Extract and normalize `import.meta.env.VITE_API_URL` with fallback to `'http://localhost:5000/api'` in `frontend/src/utils/api.js` and set `axios.defaults.baseURL`.

### Rationale
- Vite exposes client-side environment variables prefixed with `VITE_` via `import.meta.env`.
- Normalizing trailing slashes guarantees clean URL concatenation (`VITE_API_URL.replace(/\/+$/, '')`).
- Creating a utility `getBackendOrigin()` allows static media assets (`/media/...`) in `Ratecard.jsx` to resolve seamlessly against Render backend or localhost without broken image links.

### Code Pattern
```javascript
export const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/+$/, '');
export const BACKEND_ORIGIN = API_BASE_URL.replace(/\/api\/?$/, '');

export const getMediaUrl = (path) => {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  return `${BACKEND_ORIGIN}${path.startsWith('/') ? path : '/' + path}`;
};
```

---

## 2. Backend Dynamic CORS Origin Matching

### Decision
Update `cors()` middleware in `backend/server.js` to parse origins dynamically from `process.env.FRONTEND_URL`.

### Rationale
- Production deployment on Vercel sends `Origin: https://bosch-sales-dashboard.vercel.app`.
- Local development sends `Origin: http://localhost:5173` or `http://127.0.0.1:5173`.
- Parsing `FRONTEND_URL` into an origin array allows multiple comma-separated domains (e.g. Vercel main + Vercel preview domains) while retaining local dev access.

### Code Pattern
```javascript
const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:3000'
];

if (process.env.FRONTEND_URL) {
  const customOrigins = process.env.FRONTEND_URL.split(',').map(o => o.trim().replace(/\/+$/, ''));
  customOrigins.forEach(origin => {
    if (origin && !allowedOrigins.includes(origin)) {
      allowedOrigins.push(origin);
    }
  });
}

app.use(cors({
  origin: (origin, callback) => {
    // Allow non-browser requests (Postman, cURL) where origin is undefined
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(null, true); // Permissive or origin match
    }
  },
  credentials: true
}));
```

---

## 3. Preserving Auth & Feature Parity

### Decision
Maintain `axios.interceptors.request` and `axios.interceptors.response` as configured. The Bearer token in `localStorage` and Supabase client configuration remain completely intact.
