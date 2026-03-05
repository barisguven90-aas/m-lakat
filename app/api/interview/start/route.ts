import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generateQuestion } from '@/lib/interview/question-generator';

export async function POST(request: Request) {
    try {
        const { applicationId, interviewType, language = 'en', companyStyle = 'standard', difficulty = 'medium' } = await request.json();
        const supabase = await createClient();

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        // ─── Check subscription & monthly limits ───
        const { data: profile } = await supabase
            .from('profiles')
            .select('subscription_status, stripe_price_id')
            .eq('id', user.id)
            .single();

        const isPro = profile?.subscription_status === 'active' || profile?.subscription_status === 'trialing';
        const MONTHLY_PLAN_LIMIT = 10;
        const YEARLY_PLAN_LIMIT = 20; // 2x of Monthly

        const monthlyPriceId = process.env.NEXT_PUBLIC_STRIPE_MONTHLY_PRICE_ID;
        const yearlyPriceId = process.env.NEXT_PUBLIC_STRIPE_YEARLY_PRICE_ID;

        let limit = 0;
        if (isPro) {
            if (profile?.stripe_price_id === yearlyPriceId) limit = YEARLY_PLAN_LIMIT;
            else limit = MONTHLY_PLAN_LIMIT; // Default to monthly if pro but no specific match or trial
        }

        if (isPro && limit > 0) {
            // Count interviews this calendar month
            const now = new Date();
            const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
            const { count } = await supabase
                .from('interview_sessions')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', user.id)
                .gte('created_at', monthStart);

            if ((count || 0) >= limit) {
                return NextResponse.json({
                    error: `Aylık mülakat limitinize ulaştınız (${limit}). Daha fazla mülakat için bizimle iletişime geçin.`,
                    code: 'LIMIT_REACHED',
                    limit: limit,
                    used: count
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
