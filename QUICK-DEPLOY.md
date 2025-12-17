# 🚀 Quick Deploy Reference

## Step-by-Step (5 minutes)

### 1. Push to GitHub
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/medical-bot.git
git push -u origin main
```

### 2. Deploy Backend on Vercel

1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Click **"Add New Project"** → Import from GitHub
3. Select your repository
4. **Root Directory**: `backend`
5. **Add Environment Variables**:
```env
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_KEY=your_anon_key
OPENAI_API_KEY=sk-xxxxx
JWT_SECRET=your_long_random_string_min_32_chars
PORT=5000
```
6. Click **Deploy**
7. **Copy backend URL**: `https://medical-bot-backend.vercel.app`

### 3. Deploy Frontend on Vercel

1. Click **"Add New Project"** again
2. Import same repository
3. **Root Directory**: `frontend`
4. **Add Environment Variable**:
```env
REACT_APP_API_URL=https://medical-bot-backend.vercel.app/api
```
5. Click **Deploy**
6. **Copy frontend URL**: `https://medical-bot-frontend.vercel.app`

### 4. Update Backend CORS

1. Go to backend project → **Settings** → **Environment Variables**
2. Add:
```env
FRONTEND_URL=https://medical-bot-frontend.vercel.app
```
3. **Redeploy** backend (Deployments → ⋯ → Redeploy)

---

## ✅ Done! Test Your App

Visit: `https://medical-bot-frontend.vercel.app`

---

## 📋 Environment Variables Checklist

### Backend (5 variables):
- [ ] `SUPABASE_URL` - From Supabase Settings → API
- [ ] `SUPABASE_KEY` - From Supabase Settings → API (anon public)
- [ ] `OPENAI_API_KEY` - From platform.openai.com/api-keys
- [ ] `JWT_SECRET` - Generate: `openssl rand -base64 32`
- [ ] `PORT` - Set to `5000`
- [ ] `FRONTEND_URL` - Your frontend Vercel URL (add after step 3)

### Frontend (1 variable):
- [ ] `REACT_APP_API_URL` - Your backend URL + `/api`

---

## 🔍 Where to Get Credentials

### Supabase:
1. Go to [app.supabase.com](https://app.supabase.com)
2. Select project → Settings → API
3. Copy "Project URL" → `SUPABASE_URL`
4. Copy "anon public" key → `SUPABASE_KEY`

### OpenAI:
1. Go to [platform.openai.com/api-keys](https://platform.openai.com/api-keys)
2. Create new secret key
3. Copy → `OPENAI_API_KEY`
4. **Important**: Add billing method to avoid rate limits

### JWT Secret:
```bash
# Generate random string:
openssl rand -base64 32
# OR use any random 32+ character string
```

---

## 🐛 Quick Troubleshooting

### API calls failing?
- Check `REACT_APP_API_URL` ends with `/api`
- Verify backend URL is correct
- Check backend is deployed and running

### CORS errors?
- Update `FRONTEND_URL` in backend
- Must match frontend URL exactly
- Redeploy backend after changing

### Database errors?
- Verify Supabase credentials
- Check Supabase project is active
- Test connection in Supabase dashboard

### OpenAI errors?
- Check API key is valid
- Verify you have credits/billing enabled
- Check usage at platform.openai.com/usage

---

## 📊 Monitor Your App

- **Vercel Dashboard**: [vercel.com/dashboard](https://vercel.com/dashboard)
- **Function Logs**: Project → Deployments → Functions
- **Supabase Dashboard**: [app.supabase.com](https://app.supabase.com)
- **OpenAI Usage**: [platform.openai.com/usage](https://platform.openai.com/usage)

---

## 🔄 Deploy Updates

```bash
git add .
git commit -m "Your update"
git push
```
Vercel auto-deploys on push! ✨

---

**For detailed instructions, see [DEPLOYMENT.md](DEPLOYMENT.md)**
