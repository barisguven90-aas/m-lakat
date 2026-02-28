"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
    Loader2, CreditCard, User, Shield, Check, Crown, Settings,
    Mail, KeyRound, Sparkles, Zap, ArrowRight, ChevronRight
} from "lucide-react";

export default function SettingsPage() {
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [activeTab, setActiveTab] = useState<'profile' | 'billing'>('profile');
    const supabase = createClient();

    useEffect(() => {
        async function fetchProfile() {
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) return;
                const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
                setProfile({ ...data, email: user.email });
            } finally {
                setLoading(false);
            }
        }
        fetchProfile();
    }, []);

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setUpdating(true);
        try {
            const { error } = await supabase
                .from('profiles')
                .update({ full_name: profile.full_name })
                .eq('id', profile.id);
            if (error) throw error;
            toast.success("Profile updated successfully");
        } catch (error) {
            toast.error("Failed to update profile");
        } finally {
            setUpdating(false);
        }
    };

    const handleManageSubscription = async () => {
        setUpdating(true);
        try {
            if (!profile.stripe_customer_id) {
                const res = await fetch('/api/stripe/create-checkout', { method: 'POST' });
                const { url } = await res.json();
                if (url) window.location.href = url;
                else toast.error("Could not create checkout session");
                return;
            }
            const res = await fetch('/api/stripe/portal', { method: 'POST' });
            const { url } = await res.json();
            if (url) window.location.href = url;
        } catch (error) {
            toast.error("Failed to redirect to billing portal");
        } finally {
            setUpdating(false);
        }
    };

    if (loading) {
        return (
            <div className="flex h-[80vh] items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                    <span className="text-sm text-slate-500">Loading settings...</span>
                </div>
            </div>
        );
    }

    const isPro = profile?.subscription_status === 'active' || profile?.subscription_status === 'trialing';
    const initials = profile?.full_name
        ? profile.full_name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
        : 'U';

    return (
        <div className="min-h-screen">
            {/* ─── Hero Header ─── */}
            <div className="relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900" />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(99,102,241,0.2),transparent)]" />
                <div className="absolute top-10 left-[10%] w-72 h-72 bg-purple-500/10 rounded-full blur-3xl" />
                <div className="absolute top-20 right-[15%] w-64 h-64 bg-blue-500/8 rounded-full blur-3xl" />

                <div className="relative container mx-auto px-6 py-10">
                    <div className="flex items-center gap-6">
                        {/* Avatar */}
                        <div className="relative">
                            <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-2xl font-black shadow-xl shadow-blue-900/40">
                                {initials}
                            </div>
                            {isPro && (
                                <div className="absolute -top-2 -right-2 h-7 w-7 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg">
                                    <Crown className="h-3.5 w-3.5 text-white" />
                                </div>
                            )}
                        </div>
                        <div>
                            <h1 className="text-2xl font-black text-white">{profile?.full_name || 'User'}</h1>
                            <p className="text-slate-400 flex items-center gap-2 mt-1">
                                <Mail className="h-3.5 w-3.5" /> {profile?.email}
                            </p>
                            {isPro && (
                                <span className="inline-flex items-center gap-1.5 mt-2 text-xs font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-full">
                                    <Crown className="h-3 w-3" /> PRO Member
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* ─── Content ─── */}
            <div className="container mx-auto px-6 -mt-4">
                <div className="flex flex-col lg:flex-row gap-6">
                    {/* Sidebar Navigation */}
                    <div className="lg:w-64 shrink-0">
                        <div className="bg-white dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700/50 shadow-lg overflow-hidden sticky top-6">
                            <nav className="p-2 space-y-1">
                                <button
                                    onClick={() => setActiveTab('profile')}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === 'profile'
                                        ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400'
                                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/30'
                                        }`}
                                >
                                    <User className="h-4 w-4" />
                                    Profile Settings
                                    <ChevronRight className="h-4 w-4 ml-auto opacity-40" />
                                </button>
                                <button
                                    onClick={() => setActiveTab('billing')}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === 'billing'
                                        ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400'
                                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/30'
                                        }`}
                                >
                                    <CreditCard className="h-4 w-4" />
                                    Plan & Billing
                                    <ChevronRight className="h-4 w-4 ml-auto opacity-40" />
                                </button>
                            </nav>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="flex-1 space-y-6 pb-10">
                        {activeTab === 'profile' && (
                            <>
                                {/* Profile Card */}
                                <Card className="border-slate-200/60 dark:border-slate-700/50 shadow-lg overflow-hidden">
                                    <CardHeader className="border-b bg-slate-50/50 dark:bg-slate-800/30">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600">
                                                <User className="h-4 w-4 text-white" />
                                            </div>
                                            <div>
                                                <CardTitle className="text-base">Personal Information</CardTitle>
                                                <CardDescription>Update your personal details here.</CardDescription>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <form onSubmit={handleUpdate}>
                                        <CardContent className="p-6 space-y-5">
                                            <div className="grid gap-2">
                                                <Label htmlFor="email" className="text-sm font-medium text-slate-700 dark:text-slate-300">Email Address</Label>
                                                <div className="relative">
                                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                                    <Input id="email" value={profile?.email} disabled className="bg-slate-50 dark:bg-slate-800/50 pl-10 h-11" />
                                                </div>
                                                <p className="text-xs text-slate-400">Email cannot be changed.</p>
                                            </div>
                                            <div className="grid gap-2">
                                                <Label htmlFor="fullname" className="text-sm font-medium text-slate-700 dark:text-slate-300">Full Name</Label>
                                                <div className="relative">
                                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                                    <Input
                                                        id="fullname"
                                                        value={profile?.full_name || ''}
                                                        onChange={e => setProfile({ ...profile, full_name: e.target.value })}
                                                        className="pl-10 h-11"
                                                        placeholder="Enter your full name"
                                                    />
                                                </div>
                                            </div>
                                        </CardContent>
                                        <CardFooter className="border-t bg-slate-50/50 dark:bg-slate-800/20 px-6 py-4 flex justify-end">
                                            <Button type="submit" disabled={updating} className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-lg shadow-blue-600/20 h-10 px-6">
                                                {updating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                                Save Changes
                                            </Button>
                                        </CardFooter>
                                    </form>
                                </Card>

                                {/* Security Card */}
                                <Card className="border-slate-200/60 dark:border-slate-700/50 shadow-lg overflow-hidden">
                                    <CardHeader className="border-b bg-slate-50/50 dark:bg-slate-800/30">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600">
                                                <KeyRound className="h-4 w-4 text-white" />
                                            </div>
                                            <div>
                                                <CardTitle className="text-base">Security</CardTitle>
                                                <CardDescription>Manage your account security settings.</CardDescription>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="p-6">
                                        <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800/30 border border-slate-200/60 dark:border-slate-700/50">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-900/20">
                                                    <Shield className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium">Password</p>
                                                    <p className="text-xs text-slate-400">Last changed: Never</p>
                                                </div>
                                            </div>
                                            <Button variant="outline" size="sm" className="text-xs">
                                                Change Password
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            </>
                        )}

                        {activeTab === 'billing' && (
                            <>
                                {/* Current Plan */}
                                <Card className="border-slate-200/60 dark:border-slate-700/50 shadow-lg overflow-hidden">
                                    <CardHeader className="border-b bg-slate-50/50 dark:bg-slate-800/30">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600">
                                                <CreditCard className="h-4 w-4 text-white" />
                                            </div>
                                            <div>
                                                <CardTitle className="text-base">Subscription Plan</CardTitle>
                                                <CardDescription>Manage your plan and billing details.</CardDescription>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="p-6 space-y-6">
                                        {/* Status Banner */}
                                        <div className={`flex items-center justify-between p-5 rounded-2xl border ${isPro
                                            ? 'bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/15 dark:to-indigo-900/10 border-blue-200 dark:border-blue-800/30'
                                            : 'bg-slate-50 dark:bg-slate-800/30 border-slate-200 dark:border-slate-700/50'
                                            }`}>
                                            <div className="flex items-center gap-4">
                                                <div className={`p-3 rounded-xl ${isPro
                                                    ? 'bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/20'
                                                    : 'bg-slate-200 dark:bg-slate-700'}`}>
                                                    {isPro
                                                        ? <Crown className="h-6 w-6 text-white" />
                                                        : <Shield className="h-6 w-6 text-slate-500 dark:text-slate-400" />}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-lg">{isPro ? 'Pro Plan' : 'Free Plan'}</p>
                                                    <p className="text-sm text-slate-500 dark:text-slate-400">
                                                        {isPro
                                                            ? `Renews on ${profile?.subscription_ends_at ? new Date(profile.subscription_ends_at).toLocaleDateString() : 'N/A'}`
                                                            : 'Limited access to features'}
                                                    </p>
                                                </div>
                                            </div>
                                            <Button
                                                onClick={handleManageSubscription}
                                                disabled={updating}
                                                className={isPro
                                                    ? "border-slate-300 dark:border-slate-600"
                                                    : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white border-0 shadow-lg shadow-blue-600/25 h-11 px-6"}
                                                variant={isPro ? "outline" : "default"}
                                            >
                                                {updating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                                {isPro ? 'Manage Subscription' : 'Upgrade to Pro'}
                                            </Button>
                                        </div>

                                        {/* Plans Comparison */}
                                        {!isPro && (
                                            <div className="grid md:grid-cols-2 gap-5">
                                                {/* Free Plan */}
                                                <div className="rounded-2xl border border-slate-200 dark:border-slate-700/50 p-6 space-y-5 bg-white dark:bg-slate-800/30">
                                                    <div>
                                                        <h3 className="font-bold text-lg">Free</h3>
                                                        <div className="flex items-baseline gap-1 mt-1">
                                                            <span className="text-3xl font-black">$0</span>
                                                            <span className="text-slate-400 text-sm">/month</span>
                                                        </div>
                                                    </div>
                                                    <div className="h-px bg-slate-200 dark:bg-slate-700" />
                                                    <ul className="space-y-3">
                                                        {['2 Interviews per month', 'Basic Feedback', 'Standard Questions'].map((f, i) => (
                                                            <li key={i} className="flex items-center gap-2.5 text-sm text-slate-600 dark:text-slate-400">
                                                                <div className="h-5 w-5 rounded-full bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center">
                                                                    <Check className="h-3 w-3 text-emerald-500" />
                                                                </div>
                                                                {f}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                    <Button variant="outline" className="w-full" disabled>
                                                        Current Plan
                                                    </Button>
                                                </div>

                                                {/* Pro Plan */}
                                                <div className="relative rounded-2xl border-2 border-blue-500/30 p-6 space-y-5 bg-gradient-to-br from-slate-900 to-indigo-950 text-white shadow-2xl shadow-blue-900/20 overflow-hidden">
                                                    <div className="absolute top-0 right-0 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl" />
                                                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-[10px] font-bold px-4 py-1.5 rounded-full uppercase tracking-widest z-10">
                                                        Most Popular
                                                    </div>
                                                    <div className="pt-3 relative z-10">
                                                        <h3 className="font-bold text-lg text-blue-200">Pro</h3>
                                                        <div className="flex items-baseline gap-1 mt-1">
                                                            <span className="text-3xl font-black">$79</span>
                                                            <span className="text-blue-300/60 text-sm">/year</span>
                                                        </div>
                                                    </div>
                                                    <div className="h-px bg-white/10" />
                                                    <ul className="space-y-3 relative z-10">
                                                        {[
                                                            'Unlimited Interviews',
                                                            'Detailed AI Analysis',
                                                            'Voice Mode Support',
                                                            'Priority Support',
                                                            'Advanced Feedback Reports'
                                                        ].map((f, i) => (
                                                            <li key={i} className="flex items-center gap-2.5 text-sm text-blue-100">
                                                                <div className="h-5 w-5 rounded-full bg-blue-500/20 flex items-center justify-center">
                                                                    <Check className="h-3 w-3 text-blue-400" />
                                                                </div>
                                                                {f}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                    <Button
                                                        onClick={handleManageSubscription}
                                                        className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-400 hover:to-indigo-400 text-white border-0 shadow-lg shadow-blue-900/40 h-11 font-semibold relative z-10"
                                                    >
                                                        <Sparkles className="h-4 w-4 mr-2" />
                                                        Start 7-Day Free Trial
                                                    </Button>
                                                </div>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
