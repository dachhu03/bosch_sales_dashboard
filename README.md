# Bosch Sales Dashboard

Pre-sales analytical dashboard for BOQ creation, solution reporting, ratecard management, and automated Super Admin review notifications.

## Environment Configuration

### Backend Environment Variables (`backend/.env`)

Configure the following variables in `backend/.env` for local runtime or add them to Render Environment Variables for production:

```env
PORT=5000
NODE_ENV=production
FRONTEND_URL=https://bosch-sales-dashboard.vercel.app

# Supabase & Auth
SUPABASE_URL=https://yockibslzahnelxngrxd.supabase.co
SUPABASE_ANON_KEY=your-supabase-anon-key
JWT_SECRET=your-secure-jwt-secret-key

# Nodemailer Gmail SMTP Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=darshhgowda03@gmail.com
SMTP_PASSWORD=your-google-app-password
EMAIL_FROM=Bosch Sales Dashboard <darshhgowda03@gmail.com>
APP_URL=https://bosch-sales-dashboard.vercel.app
```

## Running Locally

1. **Backend Server**:
   ```bash
   cd backend
   npm install
   npm run dev
   ```

2. **Frontend Development Server**:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
