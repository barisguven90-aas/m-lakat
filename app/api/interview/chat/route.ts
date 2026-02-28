import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generateQuestion } from '@/lib/interview/question-generator';
import { analyzeResponse } from '@/lib/interview/response-analyzer';

export async function POST(request: Request) {
    try {
        const { sessionId, responseText, turnNumber, language = 'en', companyStyle = 'standard' } = await request.json();
        const supabase = await createClient();

        // Auth check
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        // 1. Get Session & Application Context
        const { data: session } = await supabase
            .from('interview_sessions')
            .select('*, applications(*)')
            .eq('id', sessionId)
            .eq('user_id', user.id) // Ensure ownership
            .single();

        if (!session) return NextResponse.json({ error: 'Session not found' }, { status: 404 });

        // 2. Get Current Turn to update
        const { data: currentTurn } = await supabase
            .from('interview_turns')
            .select('*')
            .eq('session_id', sessionId)
            .eq('turn_number', turnNumber)
            .single();

        // 3. Analyze Response (runs in parallel with question generation)
        const analysisPromise = analyzeResponse(
            currentTurn?.question_text || '',
            responseText,
            session.interview_type,
            language
        );

        // 4. Check if we should end (Limit to 5 questions for MVP demo)
        const isLastTurn = turnNumber >= 5;

        // 5. Update Current Turn with response
        const analysis = await analysisPromise;
        await supabase
            .from('interview_turns')
            .update({
                response_text: responseText,
                response_timestamp: new Date().toISOString(),
                analysis: analysis
            })
            .eq('id', currentTurn?.id);

        if (isLastTurn) {
            await supabase.from('interview_sessions').update({ status: 'completed' }).eq('id', sessionId);
            return NextResponse.json({ isCompleted: true, analysis });
        }

        // 6. Fetch all history for context
        const { data: turns } = await supabase
            .from('interview_turns')
            .select('question_text, response_text')
            .eq('session_id', sessionId)
            .order('turn_number');

        const previousTurns = turns?.flatMap(t => [
            { role: 'assistant' as const, content: t.question_text },
            { role: 'user' as const, content: t.response_text || '' }
        ]) || [];

        // 7. Generate Next Question
        const nextQuestionText = await generateQuestion({
            interviewType: session.interview_type,
            jobTitle: session.applications.job_title,
            companyName: session.applications.job_company,
            jobRequirements: session.applications.job_description,
            cvData: session.applications.cv_parsed_data,
            previousTurns,
            language,
            companyStyle
        });

        // 8. Save Next Turn
        await supabase.from('interview_turns').insert({
            session_id: sessionId,
            turn_number: turnNumber + 1,
            question_text: nextQuestionText,
            question_type: 'follow_up'
        });

        return NextResponse.json({
            nextQuestion: nextQuestionText,
            turnNumber: turnNumber + 1,
            analysis, // Send back for instant feedback display
            isCompleted: false
        });

    } catch (error: any) {
        console.error('Chat Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
