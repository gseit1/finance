# Finance App - Vercel Backend API

Serverless Next.js API running on Vercel's Free Tier, integrated with Supabase PostgreSQL.

## Features
- **Analytics API (`/api/analytics/monthly-summary`)**: High-performance aggregation of monthly expenses, income, net savings, and category distribution.
- **Daily Cron Worker (`/api/crons/process-recurring`)**: Automatically executes scheduled recurring bills and subscriptions every midnight.
- **CSV Data Export (`/api/export/csv`)**: Exports user transactions for Excel / Google Sheets.
- **Health Check (`/api/health`)**: Status monitoring.

## Local Development
```bash
npm install
npm run dev
```

## Free Deployment to Vercel
1. Push this repository to GitHub.
2. Go to [Vercel Dashboard](https://vercel.com/dashboard) and click **"Add New Project"**.
3. Select your repository and set the **Root Directory** to `backend`.
4. Add the Environment Variables:
   - `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase Project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase Anon Key
   - `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase Service Role Key
   - `CRON_SECRET`: Any random secure string (e.g. generated via `openssl rand -hex 32`)
5. Click **Deploy**. Vercel will give you a live production URL (e.g. `https://your-finance-api.vercel.app`).
