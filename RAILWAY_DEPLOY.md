# Railway Deployment Guide

## Quick Deploy Steps

### Backend Service
1. Go to [railway.app](https://railway.app)
2. Create new project from GitHub repo: `my-useless-apps/Hotel-2`
3. Configure backend service:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Port**: `$PORT` (Railway auto-sets this)

### Environment Variables for Backend
```env
NODE_ENV=production
JWT_SECRET=your-super-secret-production-key-2025
PORT=$PORT
```

### Frontend Service
1. Add new service to same project
2. Connect same GitHub repo
3. Configure frontend service:
   - **Root Directory**: `frontend`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Port**: `3000`

### Environment Variables for Frontend
```env
NEXT_PUBLIC_BACKEND_URL=https://your-backend-service.railway.app
```

## Alternative: Single Service Deploy

If you want to deploy as a single service (backend only):
- Use root directory
- Start command: `npm run start:backend`
- This will serve the API on Railway

## Demo Credentials
- **Admin Username**: admin
- **Admin Password**: password

## Features
- Calendar starts January 1, 2025
- Public calendar view
- Admin panel for event management
- SQLite database (persists between deploys)
- JWT authentication
- Mobile responsive design

## Health Check
Backend includes `/health` endpoint for Railway health checks.

## Logs
Check Railway logs if deployment fails:
- Build logs for installation issues
- Runtime logs for application errors
