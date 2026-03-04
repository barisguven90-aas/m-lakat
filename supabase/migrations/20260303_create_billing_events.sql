CREATE TABLE IF NOT EXISTS billing_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    stripe_event_id TEXT UNIQUE NOT NULL,
    type TEXT NOT NULL,
    payload_json JSONB DEFAULT '{}'::jsonb,
    shown_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE billing_events ENABLE ROW LEVEL SECURITY;

-- Allow users to read their own billing events
CREATE POLICY "Users can read own billing events"
    ON billing_events FOR SELECT
    USING (auth.uid() = user_id);

-- Only service role can insert/update (backend webhooks)
