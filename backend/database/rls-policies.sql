-- Row Level Security (RLS) Policies for Karetek Medical Platform
-- Run these AFTER creating the tables and BEFORE going to production
-- These policies ensure users can only access their own data

-- ============================================================
-- ENABLE ROW LEVEL SECURITY ON ALL TABLES
-- ============================================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE consultations ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_records ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- USERS TABLE POLICIES
-- ============================================================

-- Users can view their own profile
CREATE POLICY "Users can view own profile"
ON users FOR SELECT
USING (auth.uid()::text = id::text);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
ON users FOR UPDATE
USING (auth.uid()::text = id::text);

-- Users can insert their own profile (during registration)
CREATE POLICY "Users can insert own profile"
ON users FOR INSERT
WITH CHECK (auth.uid()::text = id::text);

-- ============================================================
-- HEALTH METRICS TABLE POLICIES
-- ============================================================

-- Users can view their own health metrics
CREATE POLICY "Users can view own health metrics"
ON health_metrics FOR SELECT
USING (auth.uid()::text = user_id::text);

-- Users can insert their own health metrics
CREATE POLICY "Users can insert own health metrics"
ON health_metrics FOR INSERT
WITH CHECK (auth.uid()::text = user_id::text);

-- Users can update their own health metrics
CREATE POLICY "Users can update own health metrics"
ON health_metrics FOR UPDATE
USING (auth.uid()::text = user_id::text);

-- Users can delete their own health metrics
CREATE POLICY "Users can delete own health metrics"
ON health_metrics FOR DELETE
USING (auth.uid()::text = user_id::text);

-- ============================================================
-- CONSULTATIONS TABLE POLICIES
-- ============================================================

-- Users can view their own consultations
CREATE POLICY "Users can view own consultations"
ON consultations FOR SELECT
USING (auth.uid()::text = user_id::text);

-- Users can insert their own consultations
CREATE POLICY "Users can insert own consultations"
ON consultations FOR INSERT
WITH CHECK (auth.uid()::text = user_id::text);

-- Users can update their own consultations
CREATE POLICY "Users can update own consultations"
ON consultations FOR UPDATE
USING (auth.uid()::text = user_id::text);

-- Users can delete their own consultations
CREATE POLICY "Users can delete own consultations"
ON consultations FOR DELETE
USING (auth.uid()::text = user_id::text);

-- ============================================================
-- HEALTH RECORDS TABLE POLICIES
-- ============================================================

-- Users can view their own health records
CREATE POLICY "Users can view own health records"
ON health_records FOR SELECT
USING (auth.uid()::text = user_id::text);

-- Users can insert their own health records
CREATE POLICY "Users can insert own health records"
ON health_records FOR INSERT
WITH CHECK (auth.uid()::text = user_id::text);

-- Users can update their own health records
CREATE POLICY "Users can update own health records"
ON health_records FOR UPDATE
USING (auth.uid()::text = user_id::text);

-- Users can delete their own health records
CREATE POLICY "Users can delete own health records"
ON health_records FOR DELETE
USING (auth.uid()::text = user_id::text);

-- ============================================================
-- VERIFICATION
-- ============================================================

-- Check if RLS is enabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename IN ('users', 'health_metrics', 'consultations', 'health_records');

-- View all policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename IN ('users', 'health_metrics', 'consultations', 'health_records');

-- ============================================================
-- NOTES
-- ============================================================

/*
IMPORTANT: These policies use auth.uid() which works with Supabase Auth.

If you're using custom JWT authentication (as in our Express backend), 
you'll need to modify the authentication approach:

Option 1: Switch to Supabase Auth instead of custom JWT
- Use Supabase's signUp() and signIn() methods
- Remove bcrypt password hashing from backend
- Let Supabase handle authentication

Option 2: Create a custom auth function
- Create a function that extracts user_id from JWT
- Replace auth.uid() with your custom function
- More complex but keeps custom JWT

Option 3: Use service_role key for backend operations
- Backend uses service_role key (bypasses RLS)
- RLS is only for direct client access
- Recommended for our architecture

CURRENT SETUP: We use custom JWT, so these policies are OPTIONAL.
They provide an additional security layer if you expose Supabase directly to clients.

For development, you can skip RLS and rely on backend JWT validation.
For production, consider implementing Option 3 above.
*/
