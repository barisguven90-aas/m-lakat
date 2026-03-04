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

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('End Interview Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
