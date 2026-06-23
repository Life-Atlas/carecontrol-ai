-- Rollback CareControl tables from shared dev Supabase

-- Remove from realtime (no IF EXISTS on ALTER PUBLICATION, so use DO block)
DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime DROP TABLE public.schedules;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime DROP TABLE public.visits;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- Drop in dependency order
DROP TABLE IF EXISTS public.ratings CASCADE;
DROP TABLE IF EXISTS public.visits CASCADE;
DROP TABLE IF EXISTS public.schedules CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;
DROP FUNCTION IF EXISTS update_updated_at CASCADE;
