-- 1. PROFILES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Users can view their own profile" 
ON public.profiles FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile" 
ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- 2. INTERVIEW SESSIONS
ALTER TABLE public.interview_sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own interviews" ON public.interview_sessions;
CREATE POLICY "Users can view their own interviews" 
ON public.interview_sessions FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own interviews" ON public.interview_sessions;
CREATE POLICY "Users can insert their own interviews" 
ON public.interview_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own interviews" ON public.interview_sessions;
CREATE POLICY "Users can update their own interviews" 
ON public.interview_sessions FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own interviews" ON public.interview_sessions;
CREATE POLICY "Users can delete their own interviews" 
ON public.interview_sessions FOR DELETE USING (auth.uid() = user_id);

-- 3. INTERVIEW COSTS
ALTER TABLE public.interview_costs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own costs" ON public.interview_costs;
CREATE POLICY "Users can view their own costs" 
ON public.interview_costs FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own costs" ON public.interview_costs;
CREATE POLICY "Users can insert their own costs" 
ON public.interview_costs FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 4. CV UPLOADS (Storage Bucket Objects)
-- Note: Requires storage.objects table access. 
-- We enable policies for the 'cv-uploads' bucket specifically.
DROP POLICY IF EXISTS "Users can upload their own CVs" ON storage.objects;
CREATE POLICY "Users can upload their own CVs"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
    bucket_id = 'cv-uploads' AND 
    (storage.foldername(name))[1] = auth.uid()::text
);

DROP POLICY IF EXISTS "Users can view their own CVs" ON storage.objects;
CREATE POLICY "Users can view their own CVs"
ON storage.objects FOR SELECT TO authenticated
USING (
    bucket_id = 'cv-uploads' AND 
    (storage.foldername(name))[1] = auth.uid()::text
);

DROP POLICY IF EXISTS "Users can delete their own CVs" ON storage.objects;
CREATE POLICY "Users can delete their own CVs"
ON storage.objects FOR DELETE TO authenticated
USING (
    bucket_id = 'cv-uploads' AND 
    (storage.foldername(name))[1] = auth.uid()::text
);
