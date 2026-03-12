-- Add waitlist fields for Pro Launch
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS pro_waitlist BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS pro_waitlist_at TIMESTAMP WITH TIME ZONE;
