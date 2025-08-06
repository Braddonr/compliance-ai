# 🚀 Deployment Guide

This guide covers deploying your Compliance AI full-stack application.

## 📋 Prerequisites

1. **OpenAI API Key**: Get from [OpenAI Platform](https://platform.openai.com/api-keys)
2. **GitHub Repository**: Push your code to GitHub
3. **Environment Variables**: Prepare your environment variables

## 🎯 Option 1: Railway (Recommended - Easiest)

Railway is perfect for full-stack apps with databases.

### Steps:

1. **Create Railway Account**
   - Go to [railway.app](https://railway.app)
   - Sign up with GitHub

2. **Deploy Backend + Database**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your repository
   - Railway will detect your backend

3. **Add PostgreSQL Database**
   - In your project, click "New Service"
   - Select "Database" → "PostgreSQL"
   - Railway will automatically connect it

4. **Configure Backend Environment Variables**
   ```env
   NODE_ENV=production
   PORT=3000
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   OPENAI_API_KEY=your-openai-api-key
   FRONTEND_URL=https://your-frontend-domain.railway.app
   
   # Database (Railway will auto-populate these)
   DB_HOST=${{Postgres.PGHOST}}
   DB_PORT=${{Postgres.PGPORT}}
   DB_USERNAME=${{Postgres.PGUSER}}
   DB_PASSWORD=${{Postgres.PGPASSWORD}}
   DB_NAME=${{Postgres.PGDATABASE}}
   ```

5. **Deploy Frontend**
   - Add another service for frontend
   - Set build command: `npm run build`
   - Set start command: `npm run preview`
   - Add environment variable:
     ```env
     VITE_API_URL=https://your-backend-domain.railway.app
     ```

6. **Custom Domains (Optional)**
   - Go to Settings → Domains
   - Add your custom domain

### Railway Pricing:
- **Free Tier**: $5 credit monthly (enough for small apps)
- **Pro**: $20/month for production apps

---

## 🎯 Option 2: Vercel + Railway

Deploy frontend on Vercel (free) and backend on Railway.

### Frontend on Vercel:

1. **Connect GitHub**
   - Go to [vercel.com](https://vercel.com)
   - Import your repository
   - Select `frontend` folder as root

2. **Configure Build Settings**
   ```
   Build Command: npm run build
   Output Directory: dist
   Install Command: npm install
   ```

3. **Environment Variables**
   ```env
   VITE_API_URL=https://your-backend-domain.railway.app
   ```

### Backend on Railway:
Follow Railway steps above, but only deploy backend + database.

---

## 🎯 Option 3: Docker Deployment

For VPS or cloud servers.

### Local Testing:
```bash
# Create .env file in root
echo "OPENAI_API_KEY=your-key-here" > .env

# Start all services
docker-compose up -d

# Access the app
# Frontend: http://localhost:3001
# Backend: http://localhost:3000
```

### Production Deployment:
1. **Update docker-compose.yml** with production values
2. **Deploy to your server**:
   ```bash
   git clone your-repo
   cd your-repo
   docker-compose up -d
   ```

---

## 🎯 Option 4: Render

Similar to Railway, good alternative.

1. **Create Render Account**: [render.com](https://render.com)
2. **Deploy Backend**:
   - New Web Service
   - Connect GitHub repo
   - Root Directory: `backend`
   - Build Command: `npm install && npm run build`
   - Start Command: `npm run start:prod`

3. **Add PostgreSQL**:
   - New PostgreSQL database
   - Copy connection details to backend env vars

4. **Deploy Frontend**:
   - New Static Site
   - Root Directory: `frontend`
   - Build Command: `npm install && npm run build`
   - Publish Directory: `dist`

---

## 🔧 Environment Variables Reference

### Backend (.env):
```env
# Database
DB_HOST=your-db-host
DB_PORT=5432
DB_USERNAME=your-db-user
DB_PASSWORD=your-db-password
DB_NAME=compliance_ai

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# App
NODE_ENV=production
PORT=3000
FRONTEND_URL=https://your-frontend-domain.com

# AI
OPENAI_API_KEY=your-openai-api-key

# Optional: AWS S3
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_REGION=us-east-1
AWS_S3_BUCKET=compliance-ai-documents
```

### Frontend (.env):
```env
VITE_API_URL=https://your-backend-domain.com
```

---

## 🚀 Quick Start (Railway)

1. **Push to GitHub**:
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Deploy on Railway**:
   - Go to [railway.app](https://railway.app)
   - New Project → Deploy from GitHub
   - Add PostgreSQL service
   - Set environment variables
   - Deploy!

3. **Access Your App**:
   - Frontend: `https://your-app.railway.app`
   - Backend API: `https://your-api.railway.app`

---

## 🔍 Troubleshooting

### Common Issues:

1. **Database Connection**:
   - Ensure PostgreSQL service is running
   - Check connection string format
   - Verify environment variables

2. **CORS Errors**:
   - Update `FRONTEND_URL` in backend env
   - Check API URL in frontend env

3. **Build Failures**:
   - Check Node.js version compatibility
   - Verify all dependencies are in package.json
   - Check build commands

4. **Environment Variables**:
   - Ensure all required vars are set
   - Check for typos in variable names
   - Verify sensitive data is not in code

---

## 📞 Support

If you encounter issues:
1. Check deployment platform logs
2. Verify environment variables
3. Test API endpoints manually
4. Check database connectivity

Your app should be accessible via the provided URLs once deployed! 🎉