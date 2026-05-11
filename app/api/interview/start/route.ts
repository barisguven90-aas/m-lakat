import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generateQuestion } from '@/lib/interview/question-generator';
import { RateLimiter } from '@/lib/rate-limit';

const interviewRateLimiter = new RateLimiter(10, 60 * 60 * 1000); // 10 requests per hour

export async function POST(request: Request) {
    try {
        const { applicationId, interviewType, language = 'en', companyStyle = 'standard', difficulty = 'medium' } = await request.json();
        const supabase = await createClient();

        // Rate limiting by IP
        const ip = request.headers.get('x-forwarded-for') || 'unknown';
        if (!interviewRateLimiter.check(ip)) {
            return NextResponse.json({ error: 'Too many interview requests. Please try again later.' }, { status: 429 });
        }

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        // ─── Check subscription & monthly limits ───
        const { data: profile } = await supabase
            .from('profiles')
            .select('subscription_status, stripe_price_id')
            .eq('id', user.id)
            .single();

        const isPro = profile?.subscription_status === 'active' || profile?.subscription_status === 'trialing';

        // Limit matrix: free=1 text, pro=unlimited
        const FREE_TEXT_LIMIT = 1;

        if (!isPro) {
            const { data: allSessions } = await supabase
                .from('interview_sessions')
                .select('config, status')
                .eq('user_id', user.id)
                .in('status', ['completed', 'in_progress', 'setup', 'active']);

            let textCount = 0;
            allSessions?.forEach(s => {
                if (!s.config?.mode || s.config.mode !== 'voice') textCount++;
            });

            if (textCount >= FREE_TEXT_LIMIT) {
                return NextResponse.json({
                    error: "You've used your 1 free text interview. Upgrade to Intervio Pro to unlock unlimited practice.",
                    code: 'SUBSCRIPTION_REQUIRED'
                }, { status: 403 });
            }
        }


        // 1. Create Interview Session
        const sessionConfig = { language, companyStyle, difficulty };
        const insertData: any = {
            application_id: applicationId,
            user_id: user.id,
            interview_type: interviewType,
            status: 'active',
        };

        // Try with config column first, fallback without it
        let session: any;
        let sessionError: any;

        const result1 = await supabase
            .from('interview_sessions')
            .insert({ ...insertData, config: sessionConfig })
            .select()
            .single();

        if (result1.error && result1.error.message?.includes('config')) {
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

        // 2. Fetch Context Data (Application, CV, etc.)
        const { data: application } = await supabase
            .from('applications')
            .select('*')
            .eq('id', applicationId)
            .single();

        // 3. Generate Opening Question
        const question = await generateQuestion({
            interviewType,
            jobTitle: application.job_title,
            companyName: application.job_company,
            jobRequirements: application.job_description,
            cvData: application.cv_parsed_data,
            previousTurns: [],
            language,
            companyStyle,
            difficulty
        });

        // 4. Save First Turn
        const { error: turnError } = await supabase
            .from('interview_turns')
            .insert({
                session_id: session.id,
                turn_number: 1,
                question_text: question,
                question_type: 'opening'
            });

        if (turnError) throw turnError;

        return NextResponse.json({
            sessionId: session.id,
            question,
            turnNumber: 1,
            config: sessionConfig,
        });

    } catch (error: any) {
        console.error('Start Interview Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
