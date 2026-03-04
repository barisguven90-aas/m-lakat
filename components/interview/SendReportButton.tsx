"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Mail, Loader2, CheckCircle } from "lucide-react";
import { toast } from "sonner";

export function SendReportButton({ sessionId }: { sessionId: string }) {
    const [sending, setSending] = useState(false);
    const [sent, setSent] = useState(false);

    const handleSend = async () => {
        setSending(true);
        try {
            const res = await fetch('/api/mail/send-report', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sessionId }),
            });
            const data = await res.json();
            if (data.success) {
                setSent(true);
                toast.success("Report sent to your email!");
            } else {
                toast.error("Failed to send report. Please try again.");
            }
        } catch {
            toast.error("An error occurred. Please try again.");
        } finally {
            setSending(false);
        }
    };

    if (sent) {
        return (
            <Button disabled variant="outline" className="border-emerald-200 text-emerald-600 dark:border-emerald-800 dark:text-emerald-400 cursor-default">
                <CheckCircle className="h-4 w-4 mr-2" /> Report Sent
            </Button>
        );
    }

    return (
        <Button
            onClick={handleSend}
            disabled={sending}
            className="bg-blue-600 hover:bg-blue-500 text-white border-0 shadow-md shadow-blue-900/30"
        >
            {sending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Mail className="h-4 w-4 mr-2" />}
            Email Report
        </Button>
    );
}
