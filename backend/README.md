# Karetek Backend Setup Guide

## Prerequisites
- Node.js (v16 or higher)
- Supabase account
- OpenAI API key

## Supabase Setup

### 1. Create a Supabase Project
1. Go to [supabase.com](https://supabase.com) and create an account
2. Click "New Project"
3. Fill in your project details and wait for setup to complete

### 2. Create Database Tables
1. In your Supabase dashboard, go to "SQL Editor"
2. Copy the contents of `database/schema.sql`
3. Paste and run the SQL script to create all tables

### 3. Get Your Credentials
1. Go to Project Settings → API
2. Copy your "Project URL" (SUPABASE_URL)
3. Copy your "anon public" key (SUPABASE_ANON_KEY)

## Backend Installation

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Configure Environment Variables
Create a `.env` file in the backend directory:

```env
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

JWT_SECRET=your_secure_random_string_here

OPENAI_API_KEY=sk-your-openai-key-here

SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 3. Start the Server
```bash
npm start
```

For development with auto-reload:
```bash
npm run dev
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### User Profile
- `GET /api/profile` - Get user profile
- `PUT /api/profile` - Update user profile

### Health Metrics
- `GET /api/health-metrics` - Get all metrics
- `POST /api/health-metrics` - Add new metric
- `PUT /api/health-metrics/:id` - Update metric
- `DELETE /api/health-metrics/:id` - Delete metric

### Consultations
- `POST /api/chat` - Chat with AI
- `POST /api/chat/translate` - Translate messages
- `GET /api/consultations` - Get consultation history

### Health Records
- `GET /api/health-records` - Get all records
- `POST /api/health-records` - Add new record
- `PUT /api/health-records/:id` - Update record
- `DELETE /api/health-records/:id` - Delete record

## Database Schema

### Users Table
Stores complete user profiles with detailed information:
- Basic info: email, name, date of birth, gender
- Contact: phone, address, city, state, zip code
- Health info: blood group, height, weight
- Emergency contact details
- Medical history: conditions, allergies, medications

### Health Metrics Table
Stores user health measurements:
- Blood pressure, heart rate, blood sugar
- Weight, temperature, oxygen levels
- Timestamps and notes for each measurement

### Consultations Table
Stores AI chat consultation history:
- Complete message history
- Language preference (English/Urdu)
- Session tracking

### Health Records Table
Stores medical documents and records:
- Lab results, prescriptions, diagnoses
- File attachments
- Provider information

## Testing the API

You can test the API using tools like Postman or cURL:

```bash
# Register a user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "firstName": "John",
    "lastName": "Doe"
  }'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

## Deployment

### Vercel Deployment
The backend is configured for Vercel serverless deployment. Make sure to:
1. Set all environment variables in Vercel dashboard
2. Use the included `vercel.json` configuration
3. Deploy using `vercel --prod`

## Security Notes

- Always use strong, unique JWT_SECRET in production
- Never commit `.env` file to version control
- Keep Supabase credentials secure
- Use HTTPS in production
- Enable rate limiting (already configured)

## Support

For issues or questions, please refer to the documentation or create an issue in the repository.
