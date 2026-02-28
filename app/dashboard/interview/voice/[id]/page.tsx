import { createClient } from '@/lib/supabase/server';
import { notFound, redirect } from 'next/navigation';
import VoiceInterviewClientPage from './client';

export default async function VoiceInterviewPage({ params }: { params: { id: string } }) {
    const supabase = await createClient();
    const sessionId = (await params).id;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect('/login');

    // Fetch session with application data
    const { data: session } = await supabase
        .from('interview_sessions')
        .select('*, applications(*)')
        .eq('id', sessionId)
        .eq('user_id', user.id)
        .single();

    if (!session) notFound();

    // If already completed, redirect to feedback
    if (session.status === 'completed') {
        redirect(`/dashboard/interview/${sessionId}/feedback`);
    }

    const config = session.config || {};

    const applicationContext = {
        jobTitle: session.applications?.job_title || 'Interview',
        jobCompany: session.applications?.job_company || 'Company',
        jobDescription: session.applications?.job_description || '',
        cvData: session.applications?.cv_parsed_data || {},
    };

    return (
        <VoiceInterviewClientPage
            sessionId={sessionId}
            applicationContext={applicationContext}
            language={config.language || 'en'}
            companyStyle={config.companyStyle || 'standard'}
        />
    );
}
