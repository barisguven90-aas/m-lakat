-- Add status and notes columns to applications table
ALTER TABLE public.applications ADD COLUMN IF NOT EXISTS status text DEFAULT 'applied' CHECK (status IN ('applied', 'interviewing', 'offered', 'rejected'));
ALTER TABLE public.applications ADD COLUMN IF NOT EXISTS notes text DEFAULT '';
