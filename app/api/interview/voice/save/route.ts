import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generateComprehensiveFeedback } from '@/lib/feedback/generate-feedback';

export async function POST(request: Request) {
    try {
        const { sessionId, transcript } = await request.json();
        const supabase = await createClient();

        // Auth
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        // Verify session ownership
        const { data: session } = await supabase
            .from('interview_sessions')
            .select('*, applications(*)')
            .eq('id', sessionId)
            .eq('user_id', user.id)
            .single();

        if (!session) return NextResponse.json({ error: 'Session not found' }, { status: 404 });

        // Parse transcript into turns (Q&A pairs)
        const turns = parseTranscriptToTurns(transcript);

        // Save each turn to interview_turns table
        for (let i = 0; i < turns.length; i++) {
            await supabase.from('interview_turns').insert({
                session_id: sessionId,
                turn_number: i + 1,
                question_text: turns[i].question,
                question_type: i === 0 ? 'opening' : 'follow_up',
                response_text: turns[i].answer,
                response_timestamp: new Date().toISOString(),
            });
        }

        // Mark session as completed
        await supabase
            .from('interview_sessions')
            .update({ status: 'completed' })
            .eq('id', sessionId);

        // Generate comprehensive feedback
        if (turns.length > 0) {
            try {
                const feedbackTurns = turns.map(t => ({
                    question_text: t.question,
                    response_text: t.answer,
                }));

                const feedback = await generateComprehensiveFeedback(
                    session.interview_type,
                    session.applications,
                    session.applications?.cv_parsed_data,
                    feedbackTurns
                );

                await supabase.from('session_feedback').insert({
                    session_id: sessionId,
                    ...feedback,
                });
            } catch (feedbackError) {
                console.error('Feedback generation failed:', feedbackError);
                // Still succeed — feedback can be generated lazily on the feedback page
            }
        }

        return NextResponse.json({
            success: true,
            turnsCount: turns.length,
            sessionId,
        });

    } catch (error: any) {
        console.error('Voice Save Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

/**
 * Parse a flat transcript array into Q&A turn pairs.
 * Each assistant message is a question, followed by the next user message as the answer.
 */
function parseTranscriptToTurns(
    transcript: { role: 'user' | 'assistant'; content: string }[]
): { question: string; answer: string }[] {
    const turns: { question: string; answer: string }[] = [];

    if (!transcript || transcript.length === 0) return turns;

    let currentQuestion: string | null = null;
    let currentAnswerParts: string[] = [];

    for (const entry of transcript) {
        if (entry.role === 'assistant') {
            // If we have a pending question with an answer, save the turn
            if (currentQuestion && currentAnswerParts.length > 0) {
                turns.push({
                    question: currentQuestion,
                    answer: currentAnswerParts.join(' '),
                });
                currentAnswerParts = [];
            }
            currentQuestion = entry.content;
        } else if (entry.role === 'user') {
            currentAnswerParts.push(entry.content);
        }
    }

    // Save the last turn if it has both Q and A
    if (currentQuestion && currentAnswerParts.length > 0) {
        turns.push({
            question: currentQuestion,
            answer: currentAnswerParts.join(' '),
        });
    }

    return turns;
}
