CREATE TABLE IF NOT EXISTS public.interview_costs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    interview_id UUID REFERENCES public.interview_sessions(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    groq_tokens_used INTEGER DEFAULT 0,
    gpt4o_tokens_used INTEGER DEFAULT 0,
    speech_minutes_used NUMERIC DEFAULT 0.0,
    estimated_cost_usd NUMERIC DEFAULT 0.0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS policies
ALTER TABLE public.interview_costs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own costs"
    ON public.interview_costs FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own costs"
    ON public.interview_costs FOR INSERT
    WITH CHECK (auth.uid() = user_id);
