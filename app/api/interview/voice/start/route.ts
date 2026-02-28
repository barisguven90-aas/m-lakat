import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
    try {
        const { applicationId, interviewType, language = 'en', companyStyle = 'standard' } = await request.json();
        const supabase = await createClient();

        // Auth
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        // Create Interview Session with voice mode config
        const sessionConfig = { language, companyStyle, mode: 'voice' as const };

        // Try to insert with config column first, fall back without if column doesn't exist
        let session: any;
        let sessionError: any;

        const insertData: any = {
            application_id: applicationId,
            user_id: user.id,
            interview_type: interviewType,
            status: 'active',
        };

        // Try with config first
        const result1 = await supabase
            .from('interview_sessions')
            .insert({ ...insertData, config: sessionConfig })
            .select()
            .single();

        if (result1.error && result1.error.message?.includes('config')) {
            // config column doesn't exist — insert without it
            const result2 = await supabase
                .from('interview_sessions')
                .insert(insertData)
                .select()
                .single();
            session = result2.data;
            sessionError = result2.error;
        } else {
            session = result1.data;
            sessionError = result1.error;
        }

        if (sessionError) throw sessionError;

        // Fetch Application Context (job + CV)
        const { data: application } = await supabase
            .from('applications')
            .select('*')
            .eq('id', applicationId)
            .single();

        if (!application) {
            return NextResponse.json({ error: 'Application not found' }, { status: 404 });
        }

        // Build context for the ElevenLabs agent
        const applicationContext = {
            jobTitle: application.job_title || '',
            jobCompany: application.job_company || '',
            jobDescription: application.job_description || '',
            jobLocation: application.job_location || '',
            cvData: application.cv_parsed_data || {},
            matchScore: application.match_score || null,
            matchAnalysis: application.match_analysis || null,
        };

        return NextResponse.json({
            sessionId: session.id,
            config: sessionConfig,
            applicationContext,
        });

    } catch (error: any) {
        console.error('Voice Start Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
