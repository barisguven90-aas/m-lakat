import { createClient } from '@/lib/supabase/server';
import { sendFeedbackEmail } from '@/lib/mail/send-feedback';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    const { sessionId } = await request.json();
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: session } = await supabase
        .from('interview_sessions')
        .select('*, applications(*), session_feedback(*)')
        .eq('id', sessionId)
        .single();

    if (!session || !session.session_feedback?.[0]) {
        return NextResponse.json({ error: 'No feedback found' }, { status: 404 });
    }

    const feedback = session.session_feedback[0];
    const application = session.applications;

    const result = await sendFeedbackEmail(
        user.email!,
        user.user_metadata.full_name || 'Interviewee',
        application.job_title,
        application.job_company,
        feedback,
    );

    return NextResponse.json(result);
}
