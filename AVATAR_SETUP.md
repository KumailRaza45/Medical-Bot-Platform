# 🎯 Simplified Avatar Setup Guide

## Architecture Overview

**Old (Complex & Expensive)**:
- User question → ElevenLabs (audio) → Supabase → HeyGen (new video) → Wait 30-60s → Play
- Cost: ~$0.30-1.00 per response
- Time: 30-60 seconds

**New (Simple & Fast)**:
- User question → ElevenLabs (audio) → Play audio + switch video
- Cost: ~$0.001 per response (300x cheaper!)
- Time: 2-5 seconds (10x faster!)

---

## What You Need

### 1. Two Avatar Videos (One-time setup)

**Idle Video** (`avatar-idle.mp4`):
- 5-10 seconds, loops continuously
- Avatar in neutral state, minimal movement
- 720×960 resolution (9:16 vertical)

**Speaking Video** (`avatar-speaking.mp4`):
- 5-10 seconds, loops while speaking
- Avatar with subtle mouth/head movement
- Same resolution 720×960 (9:16)

**Where to get videos:**
- **Record yourself**: Use phone camera (5 minutes)
- **Hire on Fiverr**: $5-20 for custom avatar video
- **Stock footage**: Pexels, Pixabay (free)
- **AI avatars**: HeyGen (one-time $0.30, reuse forever)

### 2. ElevenLabs API Key (for audio)

**Sign up**: https://elevenlabs.io/
- Free tier: 10,000 characters/month
- Starter: $5/month (30,000 chars)

**Get API Key**:
1. Sign up/login
2. Profile → API Key
3. Copy key (starts with `sk_...`)

---

## Setup Steps

### Step 1: Upload Videos to Supabase

1. Go to [Supabase Dashboard](https://app.supabase.com/)
2. Select your project
3. Storage → Create bucket: `avatar-videos` (make public)
4. Upload both videos:
   - `avatar-idle.mp4`
   - `avatar-speaking.mp4`
5. Copy public URLs

### Step 2: Create Audio Storage Bucket

1. Same Supabase project
2. Storage → Create bucket: `avatar-audio` (make public)
3. Policies → Add:
```sql
-- Public read
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'avatar-audio');

-- Backend uploads
CREATE POLICY "Service Uploads"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'avatar-audio');
```

### Step 3: Update Environment Variables

Edit `backend/.env`:
```env
# Supabase (you already have these)
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_KEY=eyJ...

# ElevenLabs (ONLY service needed)
ELEVENLABS_API_KEY=sk_your_key_here
```

**Note**: No HeyGen needed! Much simpler.

### Step 4: Update Frontend Video URLs

Edit `frontend/src/pages/AvatarPageNew.js` (line 21-22):
```javascript
const [idleVideoUrl] = useState('YOUR_SUPABASE_IDLE_VIDEO_URL');
const [speakingVideoUrl] = useState('YOUR_SUPABASE_SPEAKING_VIDEO_URL');
```

### Step 5: Install Backend Dependencies

```bash
cd backend
npm install @supabase/supabase-js
```

### Step 6: Deploy Backend

```bash
cd backend
vercel --prod
```

Make sure environment variables are set in Vercel Dashboard.

### Step 7: Test

1. Open: https://medical-bot-platform-frontend.vercel.app/avatar
2. Ask a question
3. Should see:
   - "Processing..." (chatbot responding)
   - Audio plays with speaking video (2-5 seconds)
   - Returns to idle video when done
4. Ask same question → instant (cached)

---

## Cost Comparison

**100 questions/day, 200 chars/response:**

| Service | Old | New | Savings |
|---------|-----|-----|---------|
| ElevenLabs Audio | $30/mo | $30/mo | $0 |
| HeyGen Video | $900/mo | $0 | **$900/mo** |
| Supabase Storage | Free | Free | $0 |
| **Total** | **$930/mo** | **$30/mo** | **97% cheaper!** |

**Speed:**
- Old: 30-60 seconds per response
- New: 2-5 seconds per response
- **10x faster!**

---

## How It Works

1. **User asks question** → Chatbot responds with text
2. **Frontend calls** `/api/avatar/speak` with text
3. **Backend**:
   - Generates audio with ElevenLabs (~2 seconds)
   - Uploads to Supabase Storage
   - Returns audio URL
4. **Frontend**:
   - Switches from idle → speaking video
   - Plays audio
   - When audio ends → back to idle video
5. **Caching**: Same question = instant replay (no API call)

---

## Troubleshooting

**"Video won't play"**
- Check video URL is correct and public
- Verify video format is MP4 (H.264 codec)
- Check browser console for errors

**"No audio"**
- Check ElevenLabs API key
- Verify Supabase bucket exists and is public
- Check browser audio is not muted

**"ElevenLabs error"**
- Verify API key is correct
- Check you have credits remaining
- View ElevenLabs dashboard for usage

---

## Optional: Create Avatar Videos with HeyGen (One-Time)

If you don't have avatar videos, generate them once with HeyGen:

1. Sign up at https://www.heygen.com/
2. Create avatar (or use pre-made)
3. Generate two videos:
   - "Hello" (10 seconds) → save as `avatar-speaking.mp4`
   - "." (silent, 10 seconds) → save as `avatar-idle.mp4`
4. Cost: $0.30-0.60 total (one-time)
5. Upload to Supabase
6. Reuse forever!

---

## Benefits of This Approach

✅ **97% cheaper** ($30/mo vs $930/mo)  
✅ **10x faster** (2-5s vs 30-60s)  
✅ **Simpler code** (no polling, no video generation)  
✅ **Better UX** (instant response for cached queries)  
✅ **Same quality** (professional voices + smooth video)  
✅ **One-time video cost** (reuse same videos forever)

---

## Next Steps

1. [ ] Get ElevenLabs API key
2. [ ] Record/download avatar videos (idle + speaking)
3. [ ] Upload videos to Supabase Storage
4. [ ] Create avatar-audio bucket
5. [ ] Update .env with ElevenLabs key
6. [ ] Update frontend video URLs
7. [ ] Deploy backend
8. [ ] Test on production

Need help? Check the main README or ask!
