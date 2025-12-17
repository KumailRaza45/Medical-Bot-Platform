# Karetek Medical Platform - Complete Setup Guide

## 🎯 Overview
This guide will help you set up the complete backend infrastructure with Supabase database integration.

## ✅ What's Already Done
- ✅ Supabase client integration code
- ✅ Complete database schema (4 tables)
- ✅ Backend API with all endpoints (auth, profile, health metrics, consultations)
- ✅ Frontend API utilities
- ✅ Profile management page
- ✅ Health metrics tracking with database
- ✅ Authentication system (JWT tokens)

## 📋 What You Need to Do

### Step 1: Create Supabase Account & Project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign up for a free account (or login if you have one)
3. Click "New Project"
4. Fill in:
   - **Project Name**: karetek-medical (or your choice)
   - **Database Password**: Choose a strong password and **SAVE IT**
   - **Region**: Choose closest to your location
   - **Pricing Plan**: Free tier is sufficient for development

5. Wait 2-3 minutes for project creation

### Step 2: Get Your Supabase Credentials

1. In your Supabase project dashboard, click on **Settings** (gear icon) in the sidebar
2. Click on **API** under Project Settings
3. Copy these values:
   - **Project URL** (looks like: `https://xxxxxxxxxxxxx.supabase.co`)
   - **anon/public key** (long string starting with `eyJ...`)

### Step 3: Create Database Tables

1. In Supabase dashboard, click **SQL Editor** in the sidebar
2. Click **New Query**
3. Open the file `backend/database/schema.sql` from this project
4. Copy **ALL** the SQL code from that file
5. Paste it into the Supabase SQL Editor
6. Click **Run** (or press `Ctrl+Enter`)
7. You should see "Success. No rows returned" - this is correct!

**Verify tables were created:**
- Click **Table Editor** in sidebar
- You should see 4 tables: `users`, `health_metrics`, `consultations`, `health_records`

### Step 4: Configure Backend Environment Variables

1. Navigate to the `backend` folder
2. Create a new file named `.env` (no filename, just the extension)
3. Add the following content:

```env
# Supabase Configuration
SUPABASE_URL=your_project_url_here
SUPABASE_ANON_KEY=your_anon_key_here

# OpenAI API Configuration
OPENAI_API_KEY=your_openai_api_key_here

# JWT Configuration
JWT_SECRET=karetek_secret_key_2025_change_this_in_production

# Server Configuration
PORT=5000
NODE_ENV=development
```

4. Replace the placeholder values:
   - `SUPABASE_URL`: Paste the Project URL from Step 2
   - `SUPABASE_ANON_KEY`: Paste the anon key from Step 2
   - `OPENAI_API_KEY`: Your OpenAI API key (get from [platform.openai.com](https://platform.openai.com))
   - `JWT_SECRET`: Change to a random long string for production

### Step 5: Install Dependencies & Start Backend

```bash
# In the backend directory
cd backend
npm install
npm start
```

You should see:
```
✅ Connected to Supabase successfully
🚀 Server running on port 5000
```

### Step 6: Start Frontend

Open a **new terminal** window:

```bash
# In the frontend directory
cd frontend
npm install
npm start
```

Frontend will open at `http://localhost:3000`

## 🧪 Testing the Application

### Test 1: User Registration
1. Go to `http://localhost:3000/register`
2. Fill in the registration form
3. Click "Sign Up"
4. You should be redirected to the dashboard

**Verify in Supabase:**
- Go to Table Editor > users table
- You should see your new user record

### Test 2: Login
1. Logout (if logged in)
2. Go to `/login`
3. Enter your credentials
4. You should be redirected to dashboard

### Test 3: User Profile
1. Navigate to `/profile` (or click Profile in navigation)
2. Click "Edit Profile"
3. Fill in details:
   - Personal info (name, DOB, gender)
   - Address information
   - Health info (blood group, height, weight)
   - Medical conditions/allergies
   - Emergency contact
4. Click "Save Changes"
5. Refresh the page - your data should persist

**Verify in Supabase:**
- Check the users table - your profile fields should be updated

### Test 4: Health Metrics
1. Navigate to `/health-metrics`
2. Click "Add New Metric"
3. Select metric type (Blood Pressure, Glucose, etc.)
4. Enter value and unit
5. Add optional notes
6. Click "Add Metric"

**Verify in Supabase:**
- Check health_metrics table - should see your new entry

### Test 5: AI Chatbot
1. Go to Dashboard or Consultations page
2. Type a health-related question
3. The AI should respond
4. Check `/consultations` to see conversation history

**Verify in Supabase:**
- Check consultations table - should see your chat session

## 🔍 Troubleshooting

### Backend won't start
**Error**: "Supabase URL or Anonymous Key not configured"
- **Solution**: Make sure `.env` file exists in `backend` folder with correct credentials

**Error**: "Invalid Supabase credentials"
- **Solution**: Double-check you copied the correct URL and anon key from Supabase dashboard

### Database errors
**Error**: "relation 'users' does not exist"
- **Solution**: Run the schema.sql file in Supabase SQL Editor (Step 3)

**Error**: "duplicate key value violates unique constraint"
- **Solution**: Email already exists - use a different email for registration

### Frontend errors
**Error**: "Network Error" or "Failed to fetch"
- **Solution**: Make sure backend is running on port 5000
- Check backend terminal for errors

**Error**: "401 Unauthorized"
- **Solution**: Token expired or invalid - logout and login again

## 📊 Database Schema Overview

### users table
Stores complete user profile:
- Basic info: email, password, name, DOB, gender
- Contact: phone, address (city, state, zip, country)
- Health: blood group, height, weight, BMI
- Medical: conditions, allergies, medications (arrays)
- Emergency contact: name and phone

### health_metrics table
Tracks health measurements over time:
- Blood Pressure
- Blood Glucose
- Weight
- Heart Rate
- Temperature
- Oxygen Saturation

Each metric has: value, unit, notes, timestamp

### consultations table
Stores AI chat sessions:
- User ID
- Session ID
- Language preference
- Messages array (JSONB)
- Timestamps

### health_records table
Medical documents and records:
- Record type, title, description
- File URL (for document uploads)
- Date, provider name
- Timestamps

## 🚀 Deployment Considerations

### Environment Variables for Production
Update `.env` with production values:
- Use strong, random JWT_SECRET
- Use production Supabase project
- Enable RLS (Row Level Security) in Supabase
- Add CORS configuration for production domain

### Supabase Security
Enable Row Level Security (RLS):
```sql
-- In Supabase SQL Editor
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE consultations ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_records ENABLE ROW LEVEL SECURITY;

-- Add policies (see backend/database/rls-policies.sql if available)
```

## 📞 Support

If you encounter issues:
1. Check backend terminal for error messages
2. Check browser console for frontend errors
3. Verify Supabase credentials are correct
4. Make sure all dependencies are installed
5. Check that schema.sql ran successfully

## 🎉 Success Checklist

- [ ] Supabase project created
- [ ] Database tables created (4 tables visible in Table Editor)
- [ ] Backend `.env` file configured
- [ ] Backend starts without errors
- [ ] Frontend starts and loads
- [ ] Can register new user
- [ ] Can login successfully
- [ ] Profile page loads and can be edited
- [ ] Health metrics can be added
- [ ] AI chatbot responds to messages

Once all items are checked, your application is fully operational! 🚀
