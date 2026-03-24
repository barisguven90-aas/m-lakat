import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generateQuestion } from '@/lib/interview/question-generator';
import { analyzeResponse } from '@/lib/interview/response-analyzer';

export const maxDuration = 60;

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

        // 3. Start Response Analysis
        const analysisPromise = analyzeResponse(
            currentTurn?.question_text || '',
            responseText,
            session.interview_type,
            language
        );

        // 4. Check if we should end
        const isLastTurn = turnNumber >= 12;

        if (isLastTurn) {
            const analysis = await analysisPromise;
            await supabase
                .from('interview_turns')
                .update({
                    response_text: responseText,
                    response_timestamp: new Date().toISOString(),
                    analysis: analysis
                })
                .eq('id', currentTurn?.id);
            await supabase.from('interview_sessions').update({ status: 'completed' }).eq('id', sessionId);
            return NextResponse.json({ isCompleted: true, analysis });
        }

        // 5. Fetch history and start Question Generation
        const { data: turns } = await supabase
            .from('interview_turns')
            .select('question_text, response_text')
            .eq('session_id', sessionId)
            .order('turn_number');

        const previousTurns = turns?.flatMap(t => [
            { role: 'assistant' as const, content: t.question_text || '' },
            { role: 'user' as const, content: t.response_text || '' }
        ]) || [];
        
        // Add current turn data correctly to history before generating next
        previousTurns.push({ role: 'assistant' as const, content: currentTurn?.question_text || '' });
        previousTurns.push({ role: 'user' as const, content: responseText || '' });

        const nextQuestionPromise = generateQuestion({
            interviewType: session.interview_type,
            jobTitle: session.applications.job_title,
            companyName: session.applications.job_company,
            jobRequirements: session.applications.job_description,
            cvData: session.applications.cv_parsed_data,
            previousTurns,
            language,
            companyStyle
        });

        // 6. Wait for both AI tasks concurrently
        const [analysis, nextQuestionText] = await Promise.all([analysisPromise, nextQuestionPromise]);

        // 7. Update current turn
        await supabase
            .from('interview_turns')
            .update({
                response_text: responseText,
                response_timestamp: new Date().toISOString(),
                analysis: analysis
            })
            .eq('id', currentTurn?.id);

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
