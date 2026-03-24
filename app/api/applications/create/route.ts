import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { analyzeJobCVMatch, MatchAnalysisResult } from '@/lib/matching/analyze-match';
import { cookies } from 'next/headers';

export const maxDuration = 60;

export async function POST(request: Request) {
    try {
        const { jobData, cvData, cvFilepath, jobUrl } = await request.json();
        const supabase = await createClient();

        // 1. Get User
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        // 2. Analyze Match (This takes a few seconds)
        const cookieStore = await cookies();
        const locale = cookieStore.get('NEXT_LOCALE')?.value || 'en';

        let matchAnalysis: MatchAnalysisResult = {
            match_score: 50,
            summary: locale === 'tr' ? "Analiz tamamlanamadı." : "Analysis pending or failed.",
            strengths: [],
            gaps: [],
            risks: [],
            ai_job_review: {
                overview: locale === 'tr' ? "Analiz tamamlanamadı." : "Analysis could not be completed.",
                company_culture_hints: [],
                role_expectations: [],
            },
            interview_tips: [],
            candidate_profile_highlights: {
                total_experience_years: 0,
                key_skills: [],
                notable_achievements: [],
                education_summary: "",
                career_trajectory: "",
            },
        };
        try {
            matchAnalysis = await analyzeJobCVMatch(jobData, cvData, locale);
        } catch (matchError) {
            console.error("Match analysis failed (non-fatal):", matchError);
            // Proceed with default/fallback analysis so creation doesn't fail
        }

        // 3. Save to Database
        const { data: application, error } = await supabase
            .from('applications')
            .insert({
                user_id: user.id,
                job_url: jobUrl,
                job_title: jobData.title,
                job_company: jobData.companyName,
                job_description: jobData.description,
                // job_requirements removed due to schema mismatch
                // job_scraped_at removed due to schema mismatch

                cv_file_path: cvFilepath,
                // cv_file_name removed due to schema mismatch
                cv_parsed_data: cvData,

                match_score: matchAnalysis.match_score,
                match_analysis: matchAnalysis
            })
            .select()
            .single();

        if (error) {
            console.error('DB Insert Error:', error);
            return NextResponse.json({ error: 'Failed to save application' }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            applicationId: application.id,
            matchScore: matchAnalysis.match_score
        });

    } catch (error: any) {
        console.error('Create Application Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
