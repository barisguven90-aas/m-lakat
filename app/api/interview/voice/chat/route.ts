import { NextResponse } from 'next/server';
import { aiChat, aiJSON } from '@/lib/ai/client';
import { createClient } from '@/lib/supabase/server';

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

        const MAX_QUESTIONS = 5;

        const roleDescription = 'Senior Talent Acquisition Partner';

        const languageMap: Record<string, { instruction: string; initial: string }> = {
            en: { instruction: 'Conduct the entire interview strictly in English.', initial: 'Candidate has entered the room. Welcome them and ask them to introduce themselves.' },
            tr: { instruction: 'Mülakatı tamamen Türkçe olarak yürüt. Samimi ama profesyonel bir dil kullan.', initial: 'Aday odaya girdi. Mülakata başla — kısa bir karşılama yap ve kendisini tanıtmasını iste.' },
            es: { instruction: 'Conduct the entire interview strictly in Spanish (Español).', initial: 'Candidate has entered the room. Welcome them and ask them to introduce themselves in Spanish.' },
            fr: { instruction: 'Conduct the entire interview strictly in French (Français).', initial: 'Candidate has entered the room. Welcome them and ask them to introduce themselves in French.' },
            de: { instruction: 'Conduct the entire interview strictly in German (Deutsch).', initial: 'Candidate has entered the room. Welcome them and ask them to introduce themselves in German.' },
            zh: { instruction: 'Conduct the entire interview strictly in Mandarin Chinese (中文).', initial: 'Candidate has entered the room. Welcome them and ask them to introduce themselves in Mandarin Chinese.' }
        };

        const langConfig = languageMap[language] || languageMap.en;
        const languageInstruction = langConfig.instruction;

        const systemPrompt = `You are acting as a ${roleDescription} at ${applicationContext?.jobCompany || 'a company'}.
You are interviewing a candidate for the ${applicationContext?.jobTitle || 'open'} position.

LANGUAGE: ${languageInstruction}

INTERVIEW STYLE:
1. **Use the candidate's name**: Extract their first name from CV data and use it naturally. Start with "Merhaba [Name]" or "Hello [Name]".
2. **React before asking**: ALWAYS react to their previous answer before asking the next question. Use 1 sentence:
   - Good answer: "That's a great point." / "I see, that's very relevant."
   - Weak answer: "I'd love to hear a specific example on that." / "Could you elaborate?"
   Do NOT jump to the next question without reacting — that feels robotic.
3. **Warm but professional**: Be conversational, like a real person — not a chatbot. No template language.
4. Ask ONE question at a time. Keep responses concise (2-3 sentences max) to sound natural in speech.
5. If they give a vague or uninformative answer (like "let's start" or "I don't know"), react naturally — gently ask them to elaborate or rephrase.

JOB: ${applicationContext?.jobDescription?.slice(0, 2000) || 'N/A'}
CANDIDATE: ${JSON.stringify(applicationContext?.cvData || {}).slice(0, 1000)}

Generate ONLY what you will literally speak. No meta-text, no "Interviewer:" prefix, no actions like *smiles*.`;

        if (isFirst) {
            // Generate opening question
            const prompt = langConfig.initial;

            const question = await aiChat(prompt, systemPrompt, { maxTokens: 200 });

            // Save turn to DB
            await supabase.from('interview_turns').insert({
                session_id: sessionId,
                turn_number: 1,
                question_text: question,
                question_type: 'opening',
            });

            return NextResponse.json({
                question,
                turnNumber: 1,
                isCompleted: false,
            });
        }

        // Save user response to current turn
        await supabase.from('interview_turns')
            .update({ response_text: responseText })
            .eq('session_id', sessionId)
            .eq('turn_number', turnNumber);

        // Analyze response
        let analysis = null;
        try {
            analysis = await aiJSON(
                `Evaluate briefly. Question context: previous interview question. Answer: "${responseText}". Return JSON: {"score":0-100,"feedback":"one sentence","isStrong":true/false}`,
                'You are an interview evaluator. Return valid JSON only.',
                { maxTokens: 150 }
            );
        } catch { /* non-critical */ }

        // Check if interview is complete
        const nextTurnNumber = turnNumber + 1;
        if (nextTurnNumber > MAX_QUESTIONS) {
            // End interview
            await supabase.from('interview_sessions')
                .update({ status: 'completed' })
                .eq('id', sessionId);

            return NextResponse.json({
                analysis,
                isCompleted: true,
                turnNumber: nextTurnNumber,
            });
        }

        // Generate next question
        const historyText = previousTurns.map((t: any) =>
            `${t.role === 'assistant' ? 'Interviewer' : 'Candidate'}: ${t.content}`
        ).join('\n\n');

        const prompt = `Previous conversation:\n${historyText}\n\nCandidate just said: "${responseText}"\n\n(React briefly and ask the next question.)`;
        const nextQuestion = await aiChat(prompt, systemPrompt, { maxTokens: 200 });

        // Save next turn
        await supabase.from('interview_turns').insert({
            session_id: sessionId,
            turn_number: nextTurnNumber,
            question_text: nextQuestion,
            question_type: 'follow_up',
        });

        return NextResponse.json({
            nextQuestion,
            analysis,
            turnNumber: nextTurnNumber,
            isCompleted: false,
        });

    } catch (error: any) {
        console.error('Voice Chat Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
