-- Add unique constraint to session_id in consultations table
-- This allows upsert operations to work correctly

ALTER TABLE consultations 
ADD CONSTRAINT consultations_session_id_key UNIQUE (session_id);

-- Verify the constraint was added
SELECT conname, contype 
FROM pg_constraint 
WHERE conrelid = 'consultations'::regclass;
