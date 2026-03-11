-- result_leads table: capture email addresses from the results gate
-- Run in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS result_leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL,
    session_id UUID REFERENCES interview_sessions(id) ON DELETE SET NULL,
    final_score INTEGER,
    hire_probability INTEGER,
    collected_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(email)
);

-- RLS: only service role can read (via supabaseAdmin)
ALTER TABLE result_leads ENABLE ROW LEVEL SECURITY;

-- No SELECT policy for users — admin only via service role
CREATE INDEX IF NOT EXISTS idx_result_leads_email ON result_leads(email);
CREATE INDEX IF NOT EXISTS idx_result_leads_collected_at ON result_leads(collected_at);
