import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generateInterviewPlan } from '@/lib/interview/plan-generator';

export async function POST(request: Request) {
    try {
        const { applicationId, interviewType, language = 'en', companyStyle = 'standard' } = await request.json();
        const supabase = await createClient();

        // Auth
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        // ─── Check subscription & monthly limits ───
        const { data: profile } = await supabase
            .from('profiles')
            .select('subscription_status, stripe_price_id')
            .eq('id', user.id)
            .single();

        const isPro = profile?.subscription_status === 'active' || profile?.subscription_status === 'trialing';
        // Limit matrix: free=2 total, pro=unlimited
        const FREE_LIMIT = 2;

        let count = 0;
        if (!isPro) {
            // Count all sessions ever for free user
            const { count: totalCount } = await supabase
                .from('interview_sessions')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', user.id)
                .in('status', ['completed', 'in_progress', 'setup']); // Add statuses that count

            count = totalCount || 0;

            if (count >= FREE_LIMIT) {
                return NextResponse.json({
                    error: "You've used your 2 free interviews. Upgrade to Intervio Pro for unlimited practice.",
                    code: 'SUBSCRIPTION_REQUIRED',
                    limit: FREE_LIMIT,
                    used: count
                }, { status: 403 });
            }
        }

        // Fetch Application Context (job + CV)
        const { data: application } = await supabase
            .from('applications')
            .select('*')
            .eq('id', applicationId)
            .single();

        if (!application) {
            return NextResponse.json({ error: 'Application not found' }, { status: 404 });
        }

        // ─── Generate Interview Plan (Intervio Spec) ───
        let interviewPlan = null;
        try {
            interviewPlan = await generateInterviewPlan({
                jobTitle: application.job_title || '',
                jobDescription: application.job_description || '',
                requiredSkills: application.match_analysis?.required_skills || [],
                cvData: application.cv_parsed_data || {},
                language: language as 'en' | 'tr',
            });
        } catch (e) {
            console.error('Interview plan generation failed (non-critical):', e);
        }

        // Create Interview Session
        const sessionConfig = { language, companyStyle, mode: 'voice' as const };
        const cvMatchScore = application.match_score || null;

        const insertBase: any = {
            application_id: applicationId,
            user_id: user.id,
            interview_type: interviewType,
            status: 'active',
        };

        let session: any;
        let sessionError: any;

        // Try full insert first
        const result1 = await supabase
            .from('interview_sessions')
            .insert({ ...insertBase, config: sessionConfig, interview_plan: interviewPlan, cv_match_score: cvMatchScore })
            .select()
            .single();

        if (result1.error) {
            // Fallback: try without extra columns
            const result2 = await supabase
                .from('interview_sessions')
                .insert(insertBase)
                .select()
                .single();
            session = result2.data;
            sessionError = result2.error;
        } else {
            session = result1.data;
            sessionError = null;
        }

        if (sessionError) throw sessionError;

        const applicationContext = {
            jobTitle: application.job_title || '',
            jobCompany: application.job_company || '',
            jobDescription: application.job_description || '',
            jobLocation: application.job_location || '',
            cvData: application.cv_parsed_data || {},
            matchScore: cvMatchScore,
            matchAnalysis: application.match_analysis || null,
            interviewPlan,
        };

        return NextResponse.json({
            sessionId: session.id,
            config: sessionConfig,
            applicationContext,
            interviewPlan,
        });

    } catch (error: any) {
        console.error('Voice Start Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
