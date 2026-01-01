# OAuth Setup Guide - Karetek Medical Platform

This guide will help you set up Google and Facebook OAuth authentication for your Karetek application.

## Prerequisites

- A Google Cloud Platform account
- A Facebook Developer account
- Access to your backend environment variables

---

## 1. Google OAuth Setup

### Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Name it "Karetek Medical Platform" (or your choice)

### Step 2: Enable Google+ API

1. In the Google Cloud Console, go to **APIs & Services** → **Library**
2. Search for "Google+ API"
3. Click on it and press **Enable**

### Step 3: Create OAuth 2.0 Credentials

1. Go to **APIs & Services** → **Credentials**
2. Click **Create Credentials** → **OAuth client ID**
3. Configure the consent screen if prompted:
   - User Type: External
   - App name: Karetek
   - User support email: your-email@example.com
   - Developer contact: your-email@example.com
4. Choose Application type: **Web application**
5. Name: "Karetek Web Client"
6. Add Authorized JavaScript origins:
   ```
   http://localhost:3000
   https://yourdomain.com
   ```
7. Add Authorized redirect URIs:
   ```
   http://localhost:5000/auth/google/callback
   https://your-backend-domain.com/auth/google/callback
   ```
8. Click **Create**
9. **Save your Client ID and Client Secret**

### Step 4: Add to Backend Environment Variables

Add these to your `backend/.env` file:

```env
GOOGLE_CLIENT_ID=1090622966911-ul307cuf84biq8p2id6u33a8sbctvvvc.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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
GOOGLE_CALLBACK_URL=http://localhost:5000/auth/google/callback
```

For production, update the callback URL:
```env
GOOGLE_CALLBACK_URL=https://your-backend-domain.com/auth/google/callback
```

---

## 2. Facebook OAuth Setup

### Step 1: Create a Facebook App

1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Click **My Apps** → **Create App**
3. Choose app type: **Consumer**
4. Display Name: "Karetek Medical"
5. Contact Email: your-email@example.com
6. Click **Create App**

### Step 2: Add Facebook Login Product

1. In your app dashboard, click **Add Product**
2. Find **Facebook Login** and click **Set Up**
3. Choose **Web** as the platform
4. Enter your site URL: `http://localhost:3000` (for development)

### Step 3: Configure Facebook Login Settings

1. Go to **Facebook Login** → **Settings** in the left sidebar
2. Under **Valid OAuth Redirect URIs**, add:
   ```
   http://localhost:5000/auth/facebook/callback
   https://your-backend-domain.com/auth/facebook/callback
   ```
3. Save changes

### Step 4: Get App Credentials

1. Go to **Settings** → **Basic** in the left sidebar
2. Copy your **App ID** and **App Secret**

### Step 5: Add to Backend Environment Variables

Add these to your `backend/.env` file:

```env
FACEBOOK_APP_ID=your_facebook_app_id_here
FACEBOOK_APP_SECRET=your_facebook_app_secret_here
FACEBOOK_CALLBACK_URL=http://localhost:5000/auth/facebook/callback
```

For production:
```env
FACEBOOK_CALLBACK_URL=https://your-backend-domain.com/auth/facebook/callback
```

---

## 3. Additional Backend Environment Variables

Add these to your `backend/.env` file:

```env
# Session Secret (generate a random string)
SESSION_SECRET=your_random_session_secret_here_make_it_long_and_random

# Frontend URL for OAuth redirects
FRONTEND_URL=http://localhost:3000
```

For production:
```env
SESSION_SECRET=your_production_session_secret
FRONTEND_URL=https://yourdomain.com
```

---

## 4. Frontend Environment Variables

Create or update `frontend/.env` file:

```env
REACT_APP_API_URL=http://localhost:5000
```

For production (`frontend/.env.production`):
```env
REACT_APP_API_URL=https://your-backend-domain.com
```

---

## 5. Database Migration

Run the SQL migration to add OAuth fields to your users table:

1. Go to your Supabase dashboard
2. Navigate to **SQL Editor**
3. Open the file `backend/database/add-oauth-fields.sql`
4. Copy its contents
5. Paste into the SQL Editor
6. Click **Run**

This will add the following columns to your users table:
- `oauth_provider` (VARCHAR)
- `oauth_id` (VARCHAR)
- `profile_picture` (TEXT)
- `email_verified` (BOOLEAN)

---

## 6. Testing

### Development Testing

1. Start your backend:
   ```bash
   cd backend
   npm start
   ```

2. Start your frontend:
   ```bash
   cd frontend
   npm start
   ```

3. Navigate to `http://localhost:3000/login`
4. Click "Continue with Google" or "Continue with Facebook"
5. Complete the OAuth flow
6. You should be redirected to the dashboard

### Production Testing

1. Deploy your backend and frontend
2. Update all callback URLs in Google/Facebook developer consoles to use production URLs
3. Update environment variables with production values
4. Test the OAuth flow on your live site

---

## 7. Security Checklist

- [ ] Never commit `.env` files to git
- [ ] Use strong, random SESSION_SECRET (at least 32 characters)
- [ ] Ensure HTTPS is enabled in production
- [ ] Verify redirect URIs match exactly in provider consoles
- [ ] Set appropriate CORS origins in backend
- [ ] Review and limit OAuth scopes to only what's needed
- [ ] Enable 2FA on your developer accounts

---

## 8. Troubleshooting

### "redirect_uri_mismatch" Error
- Verify the callback URL in your `.env` matches exactly what's in the provider console
- Include the full URL including protocol (http/https), domain, and path
- Check for trailing slashes - they must match exactly

### "Access Blocked" Error (Google)
- Make sure your OAuth consent screen is properly configured
- Verify your app is published (or add test users)
- Check that you've enabled the necessary APIs

### Facebook Login Not Working
- Ensure Facebook Login product is added to your app
- Verify your app is not in Development mode for production use
- Check that email permissions are requested

### Users Not Being Created
- Check backend logs for errors
- Verify database migration ran successfully
- Ensure Supabase connection is working

---

## Support

For issues or questions:
- Check backend logs: `cd backend && npm start` (look for error messages)
- Review browser console for frontend errors
- Verify all environment variables are set correctly

---

## Next Steps

Once OAuth is working:
1. Consider adding Apple Sign In (requires Apple Developer account)
2. Implement email verification for regular signups
3. Add profile picture display from OAuth providers
4. Set up proper error handling and user feedback
