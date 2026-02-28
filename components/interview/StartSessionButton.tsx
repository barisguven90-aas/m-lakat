"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { PlayCircle, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export function StartSessionButton({ applicationId, variant = "default", className }: { applicationId: string, variant?: "default" | "outline" | "ghost", className?: string }) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const handleStart = async () => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/interview/start', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    applicationId,
                    interviewType: 'hr_behavioral' // Default for now, can add selector later
                })
            });

            if (!res.ok) throw new Error('Failed to start session');
            const data = await res.json();

            router.push(`/dashboard/interview/${data.sessionId}`);
        } catch (e) {
            toast.error("Could not start interview.");
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Button onClick={handleStart} disabled={isLoading} variant={variant} className={className}>
            {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <PlayCircle className="mr-2 h-5 w-5" />}
            Start New Interview
        </Button>
    );
}
