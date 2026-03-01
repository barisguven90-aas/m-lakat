-- Supabase SQL Editor Script for Stripe Integration

-- 1. Add fields to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT,
ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT,
ADD COLUMN IF NOT EXISTS stripe_price_id TEXT,
ADD COLUMN IF NOT EXISTS stripe_current_period_end TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS subscription_status TEXT;

-- 2. Optional: Allow users to view their own data
-- RLS should already be configured, but ensure that users can read these columns.
-- They likely can by default since they usually read the entire row for their own id.
