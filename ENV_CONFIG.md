# Environment Configuration Guide

## 📁 Super Simple Environment Structure

```
compliance_ai/
├── .env                    # ✨ One clean file for everything!
└── ENV_CONFIG.md          # This documentation
```

## 🎉 Why This is Better

- ✅ **Minimal**: Only 10 essential variables (was 20+)
- ✅ **Clear**: No confusing duplicates
- ✅ **Smart**: URLs auto-constructed from ports
- ✅ **Clean**: Easy to read and maintain

## 🔧 Clean & Simple `.env` Configuration

```env
# ===========================================
# COMPLIANCE AI - DEVELOPMENT CONFIGURATION
# ===========================================

# Environment
NODE_ENV=development

# Server Ports
PORT=3000                    # Backend server port
FRONTEND_PORT=5173          # Frontend dev server port

# URLs
FRONTEND_URL=http://localhost:5173    # For CORS configuration
VITE_API_URL=http://localhost:3000    # Frontend API endpoint

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=your_username
DB_PASSWORD=your_password
DB_NAME=compliance_ai

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key

# AI Configuration
OPENAI_API_KEY=your-openai-api-key

# File Storage (AWS S3 - Optional)
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_REGION=us-east-1
AWS_S3_BUCKET=compliance-ai-documents
```

## ✨ What Changed?

### ❌ Removed (No Longer Needed):
- `BACKEND_PORT` (uses `PORT`)
- `BACKEND_HOST` (hardcoded to localhost)
- `FRONTEND_HOST` (hardcoded to localhost)
- `BACKEND_URL` (auto-constructed)
- `VITE_BACKEND_URL` (uses `VITE_API_URL`)
- `VITE_BACKEND_HOST` (not needed)
- `VITE_BACKEND_PORT` (not needed)
- `VITE_NODE_ENV` (not needed)
- `VITE_ENABLE_DEBUG` (not needed)
- `ENABLE_CORS_DEBUG` (not needed)
- `ENABLE_API_LOGGING` (not needed)

### ✅ Kept (Essential Only):
- `PORT` - Backend server port
- `FRONTEND_PORT` - Frontend dev server port
- `FRONTEND_URL` - For CORS configuration
- `VITE_API_URL` - Frontend API endpoint
- Database, JWT, and API keys

## 🚀 Quick Start Commands

### Install Dependencies
```bash
npm run install:all
```

### Start Development Servers
```bash
# Start both backend and frontend
npm run dev

# Or start individually
npm run dev:backend    # Backend on port 3000
npm run dev:frontend   # Frontend on port 5173
```

### Database Setup
```bash
# Simple seeding for development
npm run seed:simple

# Full seeding
npm run seed
```

### Testing
```bash
# Test API connectivity
npm run test:api

# Test step-by-step seeding
npm run test:steps
```

## 🔧 Customizing Ports

### To Change Backend Port (e.g., to 3001):
```env
PORT=3001
VITE_API_URL=http://localhost:3001
```

### To Change Frontend Port (e.g., to 5174):
```env
FRONTEND_PORT=5174
FRONTEND_URL=http://localhost:5174
```

## 🎯 How It Works

### Backend Configuration:
- Uses `PORT` for server port
- Uses `FRONTEND_URL` for CORS
- Constructs backend URL as `http://localhost:${PORT}`

### Frontend Configuration:
- Uses `FRONTEND_PORT` for dev server
- Uses `VITE_API_URL` for API calls
- Vite proxy constructs target from `PORT`

## 🔍 Troubleshooting

### Port Conflicts
```bash
# Check what's using a port
lsof -i :3000

# Kill process on port
lsof -ti:3000 | xargs kill -9
```

### CORS Issues
- Ensure `FRONTEND_URL` matches your frontend URL
- Check backend console for CORS debug messages
- Verify `VITE_API_URL` points to correct backend

### Database Connection
- Verify database credentials in `.env`
- Ensure PostgreSQL is running locally
- Test connection with `npm run test:api`

## 📝 Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | Backend server port | `3000` |
| `FRONTEND_PORT` | Frontend dev server port | `5173` |
| `FRONTEND_URL` | Frontend URL for CORS | `http://localhost:5173` |
| `VITE_API_URL` | Frontend API endpoint | `http://localhost:3000` |
| `DB_HOST` | Database host | `localhost` |
| `DB_PORT` | Database port | `5432` |
| `DB_USERNAME` | Database username | `your_username` |
| `DB_PASSWORD` | Database password | `your_password` |
| `DB_NAME` | Database name | `compliance_ai` |
| `JWT_SECRET` | JWT signing secret | `your-secret-key` |
| `OPENAI_API_KEY` | OpenAI API key | `sk-...` |

## 🎉 Result

**Before**: 20+ confusing variables with lots of duplication
**After**: 10 clean, essential variables that are easy to understand and maintain!

Much better! 🚀