# 🔗 Connect Frontend (karetek.ai) to Backend on Vercel

## ✅ What I Fixed

### 1. Backend `vercel.json` - Optimized for API-only deployment
- Simplified routing: All requests go to `server.js`
- Added CORS headers for karetek.ai
- Removed redundant route patterns

### 2. Backend `server.js` - Express CORS Configuration  
- Allows `https://karetek.ai` and `https://www.karetek.ai`
- Handles preflight OPTIONS requests
- Supports credentials (cookies/auth headers)

### 3. Backend Routes Available
Your backend exposes these routes (all prefixed with `/api` or direct):

```
POST   /api/auth/register
POST   /api/auth/login
GET    /api/auth/me
GET    /api/profile
PUT    /api/profile
GET    /api/health-metrics
POST   /api/health-metrics
PUT    /api/health-metrics/:id
DELETE /api/health-metrics/:id
POST   /api/chat
POST   /api/chat/translate
GET    /api/consultations
GET    /api/health-records
POST   /api/health-records
PUT    /api/health-records/:id
DELETE /api/health-records/:id
GET    /api/stats
GET    /health
/api/avatar/* (avatar routes)
```

---

## 🚀 How to Connect Frontend to Backend

You have **2 options**. Choose ONE:

### **Option 1: Environment Variable (RECOMMENDED)** ✅

This is cleaner and easier to manage.

#### Steps:
1. **Get your backend URL** from Vercel dashboard
   - Example: `https://medical-bot-backend-xyz.vercel.app`

2. **Add environment variable in frontend Vercel project**:
   - Go to your frontend project in Vercel
   - Settings → Environment Variables
   - Add new variable:
     ```
     Name: REACT_APP_API_URL
     Value: https://your-backend-url.vercel.app/api
     ```
   - Environment: **Production** (check this box)
   - Save

3. **Redeploy frontend**:
   - Go to Deployments tab
   - Click "Redeploy" on latest deployment
   
   OR push a small change:
   ```bash
   git commit --allow-empty -m "Trigger redeploy"
   git push origin main
   ```

#### How frontend uses it:
Your `frontend/src/utils/api.js` already reads this:
```javascript
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
```

So frontend will call: `https://your-backend-url.vercel.app/api/auth/login`

---

### **Option 2: Vercel Rewrites** (Alternative)

Use if you want cleaner URLs (frontend makes calls to `/api/*` and Vercel proxies them).

Update `frontend/vercel.json`:
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "build",
  "devCommand": "npm start",
  "installCommand": "npm install",
  "framework": "create-react-app",
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "https://your-backend-url.vercel.app/api/:path*"
    }
  ]
}
```

**Pros**: Frontend calls `/api/login` (same domain)  
**Cons**: Another layer of proxying, slightly slower

---

## 🧪 Testing Your Setup

### 1. Test Backend Directly

```bash
# Health check
curl https://your-backend-url.vercel.app/health

# Expected response:
# {"status":"ok","timestamp":"2025-12-27T..."}

# Test stats endpoint
curl https://your-backend-url.vercel.app/api/stats

# Expected: JSON with stats data
```

### 2. Test from Frontend

1. Open https://karetek.ai
2. Open browser DevTools (F12)
3. Go to **Console** tab
4. Check for errors
5. Go to **Network** tab
6. Try to login/register
7. Check if requests go to correct backend URL

### 3. Check CORS

If you see CORS errors:
```
Access to fetch at 'https://backend...' from origin 'https://karetek.ai' 
has been blocked by CORS policy
```

**Solution**: 
- Verify backend is redeployed with new vercel.json
- Check Environment Variables in backend Vercel project include:
  ```
  FRONTEND_URL=https://karetek.ai
  ```

---

## 📋 Backend Environment Variables Checklist

Make sure these are set in **Backend** Vercel project:

```env
NODE_ENV=production
PORT=5000
FRONTEND_URL=https://karetek.ai

# Supabase
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJxxx...
SUPABASE_SERVICE_ROLE_KEY=eyJxxx...

# OpenAI
OPENAI_API_KEY=sk-proj-xxx...

# JWT
JWT_SECRET=your-secret-key-min-32-chars

# Optional: Avatar APIs
DID_API_KEY=xxx
HEYGEN_API_KEY=xxx
```

---

## 🔧 Troubleshooting

### Issue: "Route not found" errors

**Cause**: Frontend calling wrong URL

**Fix**:
1. Check `REACT_APP_API_URL` is set in frontend Vercel
2. Verify it includes `/api` at the end
3. Redeploy frontend after setting env var

---

### Issue: CORS errors persist

**Fix**:
1. Redeploy backend (push changes)
2. Check backend logs in Vercel
3. Verify `FRONTEND_URL` env var is set

---

### Issue: 404 on all backend routes

**Fix**:
1. Check backend Vercel project **Root Directory** is set to `backend`
2. Verify `vercel.json` exists in backend folder
3. Check `server.js` is in backend folder

---

### Issue: Environment variables not working

**Fix**:
Environment variables require redeploy to take effect
1. Add/update env vars in Vercel
2. Click "Redeploy" button
3. Wait for deployment to complete

---

## ✅ Final Verification Checklist

- [ ] Backend deployed successfully on Vercel
- [ ] Backend health check returns `{"status":"ok"}`
- [ ] Backend env vars all set (especially `FRONTEND_URL`)
- [ ] Frontend env var `REACT_APP_API_URL` set correctly
- [ ] Frontend redeployed after setting env var
- [ ] Can visit https://karetek.ai successfully
- [ ] Registration works
- [ ] Login works  
- [ ] Chat sends messages successfully
- [ ] No CORS errors in browser console
- [ ] Network tab shows requests going to backend URL

---

## 📞 Quick Reference

**Frontend domain**: https://karetek.ai  
**Backend URL**: https://your-backend-url.vercel.app  
**API Base URL**: https://your-backend-url.vercel.app/api

**Frontend env var**: `REACT_APP_API_URL=https://your-backend-url.vercel.app/api`  
**Backend env var**: `FRONTEND_URL=https://karetek.ai`

---

## 🎉 You're Done!

Once you add the environment variable and redeploy, your frontend at karetek.ai will successfully communicate with your backend on Vercel!
