import { createClient } from '@/lib/supabase/server';
import { notFound, redirect } from 'next/navigation';
import { InterviewInterface } from '@/components/interview/InterviewInterface';

export default async function InterviewSessionPage({ params }: { params: { id: string } }) {
    const supabase = await createClient();
    const sessionId = (await params).id;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect('/login');

    // Verify session ownership
    const { data: session } = await supabase
        .from('interview_sessions')
        .select('*, interview_turns(*)')
        .eq('id', sessionId)
        .single();

    if (!session) notFound();

    // Get the latest turn or the first one
    const turns = session.interview_turns.sort((a: any, b: any) => a.turn_number - b.turn_number);
    const currentTurn = turns[turns.length - 1]; // Last turn

    // If completed, redirect to feedback
    if (session.status === 'completed') {
        redirect(`/dashboard/interview/${sessionId}/feedback`);
    }

    // Extract config from DB (no more sessionStorage dependency)
    const config = session.config || {};
    const language = config.language || 'en';
    const companyStyle = config.companyStyle || 'standard';

    return (
        <div className="container mx-auto py-6">
            <div className="mb-4 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Mock Interview Session</h1>
                    <p className="text-muted-foreground text-sm">Focus on clear communication and the STAR method.</p>
                </div>
            </div>
            <InterviewInterface
                sessionId={sessionId}
                initialQuestion={currentTurn?.question_text || "Ready to start?"}
                initialLanguage={language}
                initialCompanyStyle={companyStyle}
            />
        </div>
    );
}
