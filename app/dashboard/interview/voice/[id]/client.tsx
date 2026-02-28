"use client";

import dynamic from 'next/dynamic';

// Dynamic import to avoid SSR issues with audio/media APIs
const VoiceInterviewInterface = dynamic(
    () => import('@/components/interview/VoiceInterviewInterface'),
    { ssr: false }
);

interface VoiceInterviewClientPageProps {
    sessionId: string;
    applicationContext: {
        jobTitle: string;
        jobCompany: string;
        jobDescription: string;
        cvData: any;
    };
    language: string;
    companyStyle: string;
}

export default function VoiceInterviewClientPage({
    sessionId,
    applicationContext,
    language,
    companyStyle,
}: VoiceInterviewClientPageProps) {
    return (
        <VoiceInterviewInterface
            sessionId={sessionId}
            applicationContext={applicationContext}
            language={language}
            companyStyle={companyStyle}
        />
    );
}
