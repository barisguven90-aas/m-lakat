"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Sparkles, ExternalLink } from "lucide-react";
import { useRouter } from "next/navigation";

interface BillingEvent {
    id: string;
    payload_json: {
        plan_name?: string;
        status?: string;
        current_period_end?: string;
    };
}

export function PaymentSuccessModal() {
    const [event, setEvent] = useState<BillingEvent | null>(null);
    const [isOpen, setIsOpen] = useState(false);
    const router = useRouter();

    useEffect(() => {
        // Fetch unshown billing events on mount
        async function fetchEvent() {
            try {
                const res = await fetch('/api/billing/events/unshown');
                if (!res.ok) return;
                const data = await res.json();

                if (data.event) {
                    const eventId = data.event.id;
                    // Check local storage to prevent infinite loops if backend RLS fails
                    if (localStorage.getItem(`payment_shown_${eventId}`)) {
                        // Attempt to sync backend if it failed earlier
                        fetch('/api/billing/events/mark-shown', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ eventId })
                        }).catch(() => { });
                        return;
                    }

                    setEvent(data.event);
                    setIsOpen(true);
                }
            } catch (error) {
                console.error("Failed to fetch billing events", error);
            }
        }

        fetchEvent();
    }, []);

    const markAsShown = async () => {
        if (!event) return;

        try {
            // Optimistic UI fallback
            localStorage.setItem(`payment_shown_${event.id}`, 'true');

            await fetch('/api/billing/events/mark-shown', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ eventId: event.id })
            });
        } catch (error) {
            console.error("Failed to mark event as shown", error);
        }
    };

    const handleClose = () => {
        setIsOpen(false);
        markAsShown();
    };

    const handleStartInterview = () => {
        setIsOpen(false);
        markAsShown();
        router.push("/dashboard/interviews"); // Assume this is where they start
    };

    const handleViewPlan = () => {
        setIsOpen(false);
        markAsShown();
        router.push("/dashboard/settings"); // Or billing portal directly
    };

    if (!event) return null;

    const planName = event.payload_json?.plan_name || "Intervio Pro";
    const status = event.payload_json?.status;
    const isTrial = status === "trialing";

    // Format date beautifully (e.g., Oct 12, 2024)
    const rawDate = event.payload_json?.current_period_end;
    const renewDate = rawDate
        ? new Date(rawDate).toLocaleDateString("en-US", { month: 'short', day: 'numeric', year: 'numeric' })
        : "Next billing cycle";

    return (
        <Dialog open={isOpen} onOpenChange={(open) => {
            if (!open) handleClose();
        }}>
            <DialogContent className="sm:max-w-md border-0 shadow-2xl overflow-hidden p-0 rounded-2xl">
                {/* Premium Header Background */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/40 dark:to-indigo-950/40 p-6 flex flex-col items-center text-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl" />

                    <div className="relative z-10 w-16 h-16 bg-white dark:bg-slate-800 rounded-full shadow-lg flex items-center justify-center mb-4">
                        <CheckCircle2 className="w-8 h-8 text-blue-600 dark:text-blue-500" />
                    </div>

                    <DialogTitle className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300">
                        Payment received
                    </DialogTitle>
                    <DialogDescription className="text-slate-600 dark:text-slate-400 font-medium mt-1">
                        Welcome to {planName}.
                    </DialogDescription>
                </div>

                <div className="p-6 space-y-6 bg-white dark:bg-slate-900">
                    {/* Subscription Details Grid */}
                    <div className="grid grid-cols-2 gap-4 text-sm bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                        <div>
                            <p className="text-slate-500 dark:text-slate-400 font-medium">Access</p>
                            <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                                {isTrial ? "Trialing for 7 days" : "Active now"}
                            </p>
                        </div>
                        <div>
                            <p className="text-slate-500 dark:text-slate-400 font-medium">Renews on</p>
                            <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">{renewDate}</p>
                        </div>
                    </div>

                    {/* Features List */}
                    <div className="space-y-3">
                        <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-blue-500" /> Unlocked features
                        </h4>
                        <ul className="space-y-2.5">
                            {[
                                "Unlimited AI interview simulations",
                                "English interview mode & speaking feedback",
                                "Structured scoring & gap analysis",
                                "Saved session history & progress tracking"
                            ].map((feature, idx) => (
                                <li key={idx} className="flex items-start gap-2.5 text-sm text-slate-600 dark:text-slate-300">
                                    <div className="mt-0.5 w-4 h-4 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center flex-shrink-0">
                                        <CheckCircle2 className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                                    </div>
                                    <span>{feature}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="bg-blue-50/50 dark:bg-blue-900/10 p-4 rounded-xl border border-blue-100/50 dark:border-blue-900/30">
                        <p className="text-sm text-blue-800 dark:text-blue-200 leading-relaxed font-medium">
                            You now have full access to role-specific interview training and performance analytics.
                        </p>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-3 pt-2">
                        <Button
                            onClick={handleStartInterview}
                            className="w-full h-11 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-md shadow-blue-500/20 text-md font-semibold"
                        >
                            Start your first interview
                        </Button>
                        <Button
                            onClick={handleViewPlan}
                            variant="outline"
                            className="w-full h-11 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
                        >
                            View my plan <ExternalLink className="w-4 h-4 ml-2 opacity-50" />
                        </Button>
                        <button
                            onClick={handleClose}
                            className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 mt-2 transition-colors font-medium"
                        >
                            Close
                        </button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
