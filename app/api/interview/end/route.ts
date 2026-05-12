import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
    try {
        const { sessionId } = await request.json();
        const supabase = await createClient();

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        // Mark the session as completed
        const { error } = await supabase
            .from('interview_sessions')
            .update({ status: 'completed' })
            .eq('id', sessionId)
            .eq('user_id', user.id); // Ensure ownership

        if (error) {
            console.error('Error ending session:', error);
            return NextResponse.json({ error: 'Failed to end session' }, { status: 500 });
        }

        // Create notification for completed interview
        try {
            await supabase.from('notifications').insert({
                user_id: user.id,
                title: 'Interview Completed! 🎉',
                message: 'Your interview session has been completed. Check your feedback report for detailed analysis and improvement tips.',
                type: 'success',
                link: `/dashboard/interview/${sessionId}/feedback`
            });
        } catch { /* silent fail if table doesn't exist yet */ }

        // Cost Calculation
        try {
            const { data: turns } = await supabase
                .from('interview_turns')
                .select('question_text, response_text')
                .eq('session_id', sessionId);
            
            const { data: session } = await supabase
                .from('interview_sessions')
                .select('config, created_at')
                .eq('id', sessionId)
                .single();

            let totalChars = 0;
            turns?.forEach(t => {
                totalChars += (t.question_text?.length || 0) + (t.response_text?.length || 0);
            });

            // Groq Llama 3.3 70B: input $0.59/1M token, output $0.79/1M token
            const estimatedGroqTokens = Math.floor(totalChars / 4);
            const groqCost = (estimatedGroqTokens * 0.59) / 1000000;

            // GPT-4o: input $2.50/1M token, output $10.00/1M token (For feedback generation)
            const gpt4oTokens = 2500; // estimated
            const gpt4oCost = (gpt4oTokens * 5.0) / 1000000; // average mix
            
            // Google Cloud Speech: $0.016/dakika
            let speechMinutes = 0;
            if (session?.config?.mode === 'voice' && session?.created_at) {
                const diffMs = Date.now() - new Date(session.created_at).getTime();
                speechMinutes = diffMs / 60000;
            }
            const speechCost = speechMinutes * 0.016;

            const totalCostUsd = groqCost + gpt4oCost + speechCost;

            await supabase.from('interview_costs').insert({
                interview_id: sessionId,
                user_id: user.id,
                groq_tokens_used: estimatedGroqTokens,
                gpt4o_tokens_used: gpt4oTokens,
                speech_minutes_used: speechMinutes,
                estimated_cost_usd: totalCostUsd
            });
        } catch (e) {
            console.error('Cost tracking error:', e);
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('End Interview Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
