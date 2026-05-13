"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { Check, Rocket, CheckCircle2, X } from "lucide-react";

export function ProComingSoonModal({
    isOpen: controlledOpen,
    onClose,
    autoShow = false
}: {
    isOpen?: boolean;
    onClose?: () => void;
    autoShow?: boolean;
}) {
    const supabase = createClient();
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [open, setOpen] = useState(controlledOpen || false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        if (controlledOpen !== undefined) {
            setOpen(controlledOpen);
        }
    }, [controlledOpen]);

    useEffect(() => {
        if (mounted && autoShow && sessionStorage.getItem('dismissedProModal') !== 'true') {
            setOpen(true);
        }
    }, [autoShow, mounted]);

    const handleClose = () => {
        setOpen(false);
        // Save to sessionStorage that user dismissed it in this session
        if (typeof window !== 'undefined') {
            sessionStorage.setItem('dismissedProModal', 'true');
        }
        if (onClose) onClose();
    };

    const handleNotifyMe = async () => {
        setSubmitting(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // Update user record: set pro_waitlist = true and pro_waitlist_at
            // If the column doesn't exist yet it might throw error, so we catch it gracefully.
            const { error } = await supabase
                .from('profiles')
                .update({
                    pro_waitlist: true,
                    pro_waitlist_at: new Date().toISOString()
                })
                .eq('id', user.id);

            if (error) {
                console.error("Waitlist error:", error);
            } else {
                // Send Waitlist Email
                fetch('/api/mail/waitlist', { method: 'POST' }).catch(e => console.error(e));
            }

            setSuccess(true);
        } catch (err) {
            console.error(err);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={(val) => {
            if (!val) handleClose();
        }}>
            <DialogContent className="sm:max-w-md max-w-[95vw] overflow-hidden p-0 border-none bg-slate-900 rounded-2xl sm:rounded-3xl max-h-[95vh]" aria-describedby="pro-waitlist-content">
                <VisuallyHidden>
                    <DialogTitle>Intervio Pro Coming Soon</DialogTitle>
                    <DialogDescription>
                        Be the first to know when Pro launches and get exclusive early access.
                    </DialogDescription>
                </VisuallyHidden>

                <div id="pro-waitlist-content" className="relative p-5 sm:p-8 overflow-y-auto max-h-[90vh]">
                    {/* Background glows */}
                    <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-indigo-500/20 rounded-full blur-[80px]" />
                    <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 bg-blue-500/20 rounded-full blur-[80px]" />

                    {success ? (
                        <div className="relative z-10 text-center py-6 flex flex-col items-center">
                            <div className="h-16 w-16 bg-emerald-500/20 rounded-full flex items-center justify-center mb-6">
                                <CheckCircle2 className="h-8 w-8 text-emerald-500" />
                            </div>
                            <h2 className="text-2xl font-bold text-white mb-2">You&apos;re on the list!</h2>
                            <p className="text-slate-400 mb-8 max-w-[280px]">
                                We&apos;ll notify you when Intervio Pro launches. 🎉
                            </p>
                            <Button
                                onClick={handleClose}
                                className="w-full rounded-xl bg-slate-800 hover:bg-slate-700 text-white border border-slate-700"
                            >
                                Close
                            </Button>
                        </div>
                    ) : (
                        <div className="relative z-10 flex flex-col items-center">
                            <div className="h-14 w-14 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-2xl flex items-center justify-center mb-5 shadow-lg shadow-indigo-500/20">
                                <Rocket className="h-6 w-6 text-white" />
                            </div>

                            <h2 className="text-xl sm:text-2xl font-bold text-white mb-2 text-center tracking-tight">
                                🚀 Intervio Pro — Coming Soon
                            </h2>
                            <p className="text-xs sm:text-sm text-slate-300 text-center mb-4 sm:mb-6 max-w-[280px]">
                                You&apos;ve used your 2 free interviews. Here&apos;s what you&apos;re missing with Pro:
                            </p>

                            <div className="w-full mb-4 sm:mb-6 bg-slate-800/50 rounded-xl border border-slate-700/50 overflow-hidden text-xs sm:text-sm">
                                <div className="grid grid-cols-3 bg-slate-800/80 p-2.5 sm:p-3 border-b border-slate-700/50 text-slate-400 font-semibold text-[10px] sm:text-xs uppercase tracking-wider">
                                    <div className="col-span-1">Feature</div>
                                    <div className="col-span-1 text-center">Free</div>
                                    <div className="col-span-1 text-center text-indigo-400">Pro</div>
                                </div>
                                <div className="divide-y divide-slate-700/50">
                                    <div className="grid grid-cols-3 p-2.5 sm:p-3 items-center hover:bg-slate-800/30 transition-colors">
                                        <div className="col-span-1 text-slate-300 leading-tight text-[11px] sm:text-xs">Interviews per month</div>
                                        <div className="col-span-1 text-center text-slate-400">2</div>
                                        <div className="col-span-1 text-center text-indigo-400 font-semibold">Unlimited</div>
                                    </div>
                                    <div className="grid grid-cols-3 p-2.5 sm:p-3 items-center hover:bg-slate-800/30 transition-colors">
                                        <div className="col-span-1 text-slate-300 leading-tight text-[11px] sm:text-xs">Interview score</div>
                                        <div className="col-span-1 flex justify-center"><Check className="h-4 w-4 text-emerald-500" /></div>
                                        <div className="col-span-1 flex justify-center"><Check className="h-4 w-4 text-emerald-500" /></div>
                                    </div>
                                    <div className="grid grid-cols-3 p-2.5 sm:p-3 items-center hover:bg-slate-800/30 transition-colors">
                                        <div className="col-span-1 text-slate-300 leading-tight text-[11px] sm:text-xs">Hire probability</div>
                                        <div className="col-span-1 flex justify-center"><Check className="h-4 w-4 text-emerald-500" /></div>
                                        <div className="col-span-1 flex justify-center"><Check className="h-4 w-4 text-emerald-500" /></div>
                                    </div>
                                    <div className="grid grid-cols-3 p-2.5 sm:p-3 items-center hover:bg-slate-800/30 transition-colors">
                                        <div className="col-span-1 text-slate-300 leading-tight text-[11px] sm:text-xs">AI feedback</div>
                                        <div className="col-span-1 text-center text-slate-400">Basic</div>
                                        <div className="col-span-1 text-center text-indigo-400 font-semibold">Detailed</div>
                                    </div>
                                    <div className="grid grid-cols-3 p-2.5 sm:p-3 items-center hover:bg-slate-800/30 transition-colors">
                                        <div className="col-span-1 text-slate-300 leading-tight text-[11px] sm:text-xs">Interview history</div>
                                        <div className="col-span-1 flex justify-center"><X className="h-4 w-4 text-slate-600" /></div>
                                        <div className="col-span-1 flex justify-center"><Check className="h-4 w-4 text-emerald-500" /></div>
                                    </div>
                                    <div className="grid grid-cols-3 p-2.5 sm:p-3 items-center hover:bg-slate-800/30 transition-colors">
                                        <div className="col-span-1 text-slate-300 leading-tight text-[11px] sm:text-xs">Progress tracking</div>
                                        <div className="col-span-1 flex justify-center"><X className="h-4 w-4 text-slate-600" /></div>
                                        <div className="col-span-1 flex justify-center"><Check className="h-4 w-4 text-emerald-500" /></div>
                                    </div>
                                    <div className="grid grid-cols-3 p-2.5 sm:p-3 items-center hover:bg-slate-800/30 transition-colors">
                                        <div className="col-span-1 text-slate-300 leading-tight text-[11px] sm:text-xs">Company personas <span className="block text-[10px] text-slate-500">(Amazon, Google etc)</span></div>
                                        <div className="col-span-1 flex justify-center"><X className="h-4 w-4 text-slate-600" /></div>
                                        <div className="col-span-1 flex justify-center"><Check className="h-4 w-4 text-emerald-500" /></div>
                                    </div>
                                    <div className="grid grid-cols-3 p-2.5 sm:p-3 items-center hover:bg-slate-800/30 transition-colors">
                                        <div className="col-span-1 text-slate-300 leading-tight text-[11px] sm:text-xs">Shareable result card</div>
                                        <div className="col-span-1 flex justify-center"><X className="h-4 w-4 text-slate-600" /></div>
                                        <div className="col-span-1 flex justify-center"><Check className="h-4 w-4 text-emerald-500" /></div>
                                    </div>
                                </div>
                            </div>

                            <p className="text-xs sm:text-sm text-slate-400 text-center mb-4 sm:mb-6 font-medium">
                                Be the first to know when Pro launches and get exclusive early access.
                            </p>

                            <div className="w-full space-y-3">
                                <Button
                                    onClick={handleNotifyMe}
                                    disabled={submitting}
                                    className="w-full rounded-xl bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-400 hover:to-blue-500 shadow-lg shadow-indigo-500/25 h-12 sm:h-14 text-sm sm:text-base font-bold text-white animate-pulse hover:animate-none ring-2 ring-indigo-400/30 ring-offset-2 ring-offset-slate-900"
                                >
                                    {submitting ? 'Please wait...' : 'Notify Me When Pro Launches →'}
                                </Button>
                                <p className="text-[11px] text-center text-slate-500 max-w-[250px] mx-auto">
                                    No spam. We&apos;ll only contact you when Pro is ready.
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
