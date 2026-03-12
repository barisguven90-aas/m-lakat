import { NextResponse } from 'next/server';
import { aiChat } from '@/lib/ai/client';
import { createClient } from '@/lib/supabase/server';
import { scoreTurn } from '@/lib/interview/scoring-engine';
import { getTurnStage, getNextQuestionFromPlan } from '@/lib/interview/plan-generator';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const {
            sessionId,
            responseText,
            turnNumber = 1,
            language = 'en',
            companyStyle = 'standard',
            applicationContext,
            isFirst = false,
            previousTurns = [],
        } = body;

        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        // Intervio spec: 7 questions max
        const MAX_QUESTIONS = 7;

        const interviewPlan = applicationContext?.interviewPlan || null;
        const currentStage = getTurnStage(turnNumber);

        // ─── Language + Stage-Aware System Prompt ───
        const languageMap: Record<string, { instruction: string; initial: string }> = {
            en: {
                instruction: 'Conduct the entire interview strictly in English.',
                initial: 'Candidate has entered the room. Welcome them warmly, introduce yourself briefly, and ask them to introduce themselves.'
            },
            tr: {
                instruction: 'Mülakatı tamamen Türkçe olarak yürüt. Samimi ama profesyonel bir dil kullan.',
                initial: 'Aday odaya girdi. Mülakata başla — sıcak bir karşılama yap, kısaca kendini tanıt ve adayın kendini tanıtmasını iste.'
            },
        };
        const langConfig = languageMap[language] || languageMap.en;

        // Interview plan context for the AI
        const planContext = interviewPlan ? `
INTERVIEW PLAN (follow this structure):
- Focus Skills: ${interviewPlan.focus_skills?.join(', ') || 'N/A'}
- Missing Skills to probe: ${interviewPlan.missing_skills?.join(', ') || 'N/A'}
- CV Match Score: ${interviewPlan.experience_match_score || 'N/A'}/100

Current Stage: ${currentStage.toUpperCase()} (Turn ${turnNumber}/${MAX_QUESTIONS})
` : `Current Turn: ${turnNumber}/${MAX_QUESTIONS}`;

        const systemPrompt = `You are a Senior Talent Acquisition Partner at ${applicationContext?.jobCompany || 'a leading company'}.
You are conducting a structured interview for the ${applicationContext?.jobTitle || 'open'} position.

LANGUAGE: ${langConfig.instruction}

${planContext}

JOB DESCRIPTION (Reference this): ${applicationContext?.jobDescription?.slice(0, 1500) || 'N/A'}
CANDIDATE CV: ${JSON.stringify(applicationContext?.cvData || {}).slice(0, 800)}

INTERVIEW CONDUCT RULES:
1. Use the candidate's first name naturally.
2. ALWAYS restrict your reaction to the candidate's previous answer to exactly 1 short sentence. NEVER give long feedback during the interview. Then ask ONE specific question.
3. This is a ${MAX_QUESTIONS}-question interview. Follow this structure based on the turn number:
   - Turn 1: Warm welcome + ask them to introduce themselves.
   - Turn 2: Ask why they chose ${applicationContext?.jobCompany || 'this company'} and this specific department.
   - Turn 3: Ask about their greatest strengths and weaknesses.
   - Turn 4: Ask a technical or role-specific question based on the job description.
   - Turn 5: Behavioral question ("Tell me about a time...") or probe a missing skill.
   - Turn 6: Another technical/CV-based question.
   - Turn 7: Ask if they have any questions and wrap up the interview professionally.
4. IMPORTANT: Keep your questions and responses extremely short and concise (max 2-3 sentences total per response).
5. If the language is Turkish, ensure you pronounce technical terms and acronyms (like KPI, Power BI, SQL, AI) properly without trying to literally translate them.
7. Generate ONLY what you will literally speak out loud. No meta-text, no "Interviewer:" prefix.
8. NONSENSE RULE: If the candidate gives a nonsensical, completely unrelated, or weird answer, DO NOT hallucinate or give a weird response back. Briefly say something like "I didn't quite catch how that relates, but let's move on" and immediately ask the NEXT scheduled question.`;

        // ─── FIRST TURN: Opening ───
        if (isFirst) {
            const question = await aiChat(langConfig.initial, systemPrompt, { maxTokens: 200 });

            await supabase.from('interview_turns').insert({
                session_id: sessionId,
                turn_number: 1,
                question_text: question,
                question_type: 'greeting',
            });

            return NextResponse.json({ question, turnNumber: 1, isCompleted: false, stage: 'greeting' });
        }

        // ─── Score the current answer ───
        let analysis: any = null;
        try {
            analysis = await scoreTurn(
                previousTurns[previousTurns.length - 1]?.content || '',
                responseText,
                currentStage === 'technical' ? 'technical' : currentStage === 'behavioral' ? 'behavioral' : 'follow_up',
                applicationContext?.jobTitle || '',
                language as 'en' | 'tr'
            );
        } catch (e) {
            console.error('Turn scoring failed (non-critical):', e);
            analysis = { score: 60, feedback: '', isStrong: true };
        }

        // Save user response + analysis to current turn
        await supabase.from('interview_turns')
            .update({ response_text: responseText, analysis })
            .eq('session_id', sessionId)
            .eq('turn_number', turnNumber);

        // ─── Check if interview is complete ───
        const nextTurnNumber = turnNumber + 1;
        if (nextTurnNumber > MAX_QUESTIONS) {
            // ─── Compute Final Score (Intervio Spec) ───
            let finalScoreResult = null;
            try {
                const { data: allTurns } = await supabase
                    .from('interview_turns')
                    .select('question_text, response_text, analysis, question_type')
                    .eq('session_id', sessionId)
                    .order('turn_number', { ascending: true });

                const { computeFinalScore } = await import('@/lib/interview/scoring-engine');
                finalScoreResult = await computeFinalScore({
                    turns: (allTurns || []).map(t => ({
                        question: t.question_text,
                        answer: t.response_text || '',
                        question_type: t.question_type,
                        analysis: t.analysis,
                    })),
                    cvMatchScore: applicationContext?.matchScore || interviewPlan?.experience_match_score || 60,
                    jobTitle: applicationContext?.jobTitle || '',
                    language: language as 'en' | 'tr',
                });

                // Save final score to session
                await supabase.from('interview_sessions')
                    .update({
                        status: 'completed',
                        final_score: finalScoreResult.final_score,
                        hire_probability: finalScoreResult.hire_probability,
                        score_breakdown: finalScoreResult.breakdown,
                        feedback_summary: finalScoreResult.feedback_summary,
                    })
                    .eq('id', sessionId);
            } catch (e) {
                console.error('Final score computation failed:', e);
                await supabase.from('interview_sessions')
                    .update({ status: 'completed' })
                    .eq('id', sessionId);
            }

            return NextResponse.json({
                analysis,
                isCompleted: true,
                turnNumber: nextTurnNumber,
                finalScore: finalScoreResult,
            });
        }

        // ─── Generate Next Question ───
        const nextStage = getTurnStage(nextTurnNumber);
        const plannedQuestion = interviewPlan ? getNextQuestionFromPlan(interviewPlan, nextTurnNumber) : null;

        const historyText = previousTurns.map((t: any) =>
            `${t.role === 'assistant' ? 'Interviewer' : 'Candidate'
            }: ${t.content} `
        ).join('\n\n');

        let prompt: string;
        if (plannedQuestion) {
            prompt = `Previous conversation: \n${historyText} \n\nCandidate just said: "${responseText}"\n\n(React briefly to their answer, then ask this planned question: "${plannedQuestion}")`;
        } else {
            prompt = `Previous conversation: \n${historyText} \n\nCandidate just said: "${responseText}"\n\nCurrent stage: ${nextStage}. React briefly then ask the next appropriate ${nextStage} question.`;
        }

        const nextQuestion = await aiChat(prompt, systemPrompt, { maxTokens: 200 });

        await supabase.from('interview_turns').insert({
            session_id: sessionId,
            turn_number: nextTurnNumber,
            question_text: nextQuestion,
            question_type: nextStage,
        });

        return NextResponse.json({
            nextQuestion,
            analysis,
            turnNumber: nextTurnNumber,
            isCompleted: false,
            stage: nextStage,
        });

    } catch (error: any) {
        console.error('Voice Chat Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
