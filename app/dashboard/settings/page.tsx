"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge"; // Added Badge import
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
            if (!isPro || !profile?.stripe_customer_id) {
                const res = await fetch('/api/stripe/checkout', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ priceId: process.env.NEXT_PUBLIC_STRIPE_YEARLY_PRICE_ID }),
                });
                const data = await res.json();
                if (data.url) window.location.href = data.url;
                else toast.error('Could not create checkout session');
                return;
            }
            const res = await fetch('/api/stripe/portal', { method: 'POST' });
            const data = await res.json();
            if (data.url) window.location.href = data.url;
            else toast.error('Could not open billing portal');
        } catch (error) {
            toast.error('Failed to redirect to billing portal');
        } finally {
            setUpdating(false);
        }
    };

    const isPro = profile?.subscription_status === 'active' || profile?.subscription_status === 'trialing';

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

    const initials = profile?.full_name
        ? profile.full_name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
        : 'U';

    return (
        <div className="min-h-screen bg-slate-50/50 dark:bg-[#0a0f1e] pb-20">
            {/* ─── Profile Cover & Header ─── */}
            <div className="w-full relative">
                {/* Cover Image (Gradient/Mesh) */}
                <div className="h-48 md:h-64 w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 relative overflow-hidden">
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
                    <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-black/20 to-transparent"></div>
                </div>

                {/* Profile Container overlapping the cover */}
                <div className="container mx-auto px-4 sm:px-6 relative -mt-12 md:-mt-14 mb-8">
                    <div className="flex flex-col sm:flex-row gap-4 sm:gap-5 items-start sm:items-end">

                        {/* Avatar */}
                        <div className="relative shrink-0">
                            <div className="h-24 w-24 rounded-2xl bg-white dark:bg-slate-900 p-1 shadow-xl">
                                <div className="h-full w-full rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-3xl font-black">
                                    {initials}
                                </div>
                            </div>
                            {isPro && (
                                <div className="absolute -bottom-1 -right-1 bg-white dark:bg-slate-900 p-1 rounded-full shadow-md">
                                    <div className="h-6 w-6 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                                        <Crown className="h-3 w-3 text-white" />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* User Info */}
                        <div className="flex-1 min-w-0 pb-1">
                            <div className="flex flex-col sm:flex-row sm:items-end gap-3 sm:gap-6 justify-between w-full">
                                <div className="min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white truncate">
                                            {profile?.full_name || 'User'}
                                        </h1>
                                        {isPro && (
                                            <span className="bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400 text-[10px] font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1 shrink-0">
                                                <Sparkles className="h-2.5 w-2.5" /> PRO
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-slate-500 dark:text-slate-400 text-sm flex items-center gap-1.5 mt-1 truncate">
                                        <Mail className="h-3.5 w-3.5 shrink-0" /> {profile?.email}
                                    </p>
                                </div>

                                {/* Action buttons */}
                                <div className="flex gap-2 shrink-0">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="rounded-full shadow-sm border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs h-8"
                                        onClick={() => {
                                            setActiveTab('profile');
                                            document.getElementById('profile-section')?.scrollIntoView({ behavior: 'smooth' });
                                        }}
                                    >
                                        <Settings className="h-3.5 w-3.5 mr-1.5" />
                                        Edit Profile
                                    </Button>
                                    {isPro && (
                                        <Button
                                            size="sm"
                                            onClick={handleManageSubscription}
                                            disabled={updating}
                                            className="rounded-full shadow-md shadow-blue-500/20 bg-blue-600 hover:bg-blue-700 text-white text-xs h-8"
                                        >
                                            {updating ? <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> : <CreditCard className="h-3.5 w-3.5 mr-1.5" />}
                                            Manage Billing
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ─── Main Content Area ─── */}
            <div className="container mx-auto px-4 sm:px-6">

                {/* Horizontal Navigation Tabs */}
                <div className="flex items-center gap-2 mb-8 border-b border-slate-200 dark:border-slate-800 pb-px overflow-x-auto no-scrollbar">
                    <button
                        onClick={() => setActiveTab('profile')}
                        className={`px-5 py-3 text-sm font-semibold transition-all relative whitespace-nowrap ${activeTab === 'profile'
                            ? 'text-blue-600 dark:text-blue-400'
                            : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
                            }`}
                    >
                        Personal Information
                        {activeTab === 'profile' && (
                            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 dark:bg-blue-400 rounded-t-full" />
                        )}
                    </button>
                    <button
                        onClick={() => setActiveTab('billing')}
                        className={`px-5 py-3 text-sm font-semibold transition-all relative whitespace-nowrap ${activeTab === 'billing'
                            ? 'text-blue-600 dark:text-blue-400'
                            : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
                            }`}
                    >
                        Plan & Billing
                        {activeTab === 'billing' && (
                            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 dark:bg-blue-400 rounded-t-full" />
                        )}
                    </button>
                </div>

                <div className="max-w-4xl" id="profile-section">
                    {activeTab === 'profile' && (
                        <div className="space-y-6">
                            {/* Profile Card */}
                            <Card className="border-0 shadow-sm ring-1 ring-slate-200 dark:ring-slate-800/60 overflow-hidden rounded-2xl">
                                <CardHeader className="bg-white dark:bg-slate-900/50 pb-4">
                                    <CardTitle className="text-lg">Basic Details</CardTitle>
                                    <CardDescription>Your personal information used across the platform.</CardDescription>
                                </CardHeader>
                                <div className="h-px bg-slate-100 dark:bg-slate-800/50 w-full" />
                                <form onSubmit={handleUpdate}>
                                    <CardContent className="p-6 md:p-8 space-y-6 bg-white dark:bg-[#0d1425]">
                                        <div className="grid md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <Label htmlFor="fullname" className="text-sm font-semibold text-slate-700 dark:text-slate-300">Full Name</Label>
                                                <div className="relative">
                                                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                                    <Input
                                                        id="fullname"
                                                        value={profile?.full_name || ''}
                                                        onChange={e => setProfile({ ...profile, full_name: e.target.value })}
                                                        className="pl-10 h-12 bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 focus-visible:ring-blue-500 rounded-xl"
                                                        placeholder="Enter your full name"
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="email" className="text-sm font-semibold text-slate-700 dark:text-slate-300">Email Address</Label>
                                                <div className="relative">
                                                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                                    <Input
                                                        id="email"
                                                        value={profile?.email}
                                                        disabled
                                                        className="pl-10 h-12 bg-slate-100 dark:bg-slate-900/80 border-slate-200 dark:border-slate-800 text-slate-500 rounded-xl cursor-not-allowed"
                                                    />
                                                </div>
                                                <p className="text-[11px] text-slate-400 mt-1">Contact support to change email.</p>
                                            </div>
                                        </div>
                                    </CardContent>
                                    <CardFooter className="bg-slate-50/80 dark:bg-slate-900/80 px-6 py-4 border-t border-slate-100 dark:border-slate-800/60 flex justify-end">
                                        <Button
                                            type="submit"
                                            disabled={updating}
                                            className="bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200 rounded-full px-6 transition-all"
                                        >
                                            {updating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                            Save Changes
                                        </Button>
                                    </CardFooter>
                                </form>
                            </Card>

                            {/* Security Card */}
                            <Card className="border-0 shadow-sm ring-1 ring-slate-200 dark:ring-slate-800/60 overflow-hidden rounded-2xl">
                                <CardHeader className="bg-white dark:bg-slate-900/50 pb-4">
                                    <CardTitle className="text-lg">Security & Privacy</CardTitle>
                                    <CardDescription>Keep your account secure.</CardDescription>
                                </CardHeader>
                                <div className="h-px bg-slate-100 dark:bg-slate-800/50 w-full" />
                                <CardContent className="p-4 md:p-6 bg-white dark:bg-[#0d1425]">
                                    <div className="flex flex-col sm:flex-row items-center justify-between p-4 rounded-xl border border-slate-100 dark:border-slate-800/80 hover:border-slate-200 dark:hover:border-slate-700 transition-colors gap-4">
                                        <div className="flex items-center gap-4 w-full sm:w-auto">
                                            <div className="h-10 w-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                                                <Shield className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                                            </div>
                                            <div>
                                                <p className="font-semibold text-sm">Account Password</p>
                                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Use a secure password to protect your account.</p>
                                            </div>
                                        </div>
                                        <Button variant="outline" className="rounded-full w-full sm:w-auto shrink-0 shadow-sm border-slate-200 dark:border-slate-800">
                                            Update Password
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    )}

                    {activeTab === 'billing' && (
                        <div className="space-y-6">
                            <Card className="border-0 shadow-sm ring-1 ring-slate-200 dark:ring-slate-800/60 overflow-hidden rounded-2xl">
                                <CardHeader className="bg-white dark:bg-slate-900/50 pb-4 flex flex-row items-center justify-between">
                                    <div>
                                        <CardTitle className="text-lg">Current Plan</CardTitle>
                                        <CardDescription>Manage your subscription and billing cycle.</CardDescription>
                                    </div>
                                    <div className="hidden sm:block">
                                        {isPro ? (
                                            <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100 border-0 flex gap-1 items-center px-3 py-1">
                                                <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" /> Active Match
                                            </Badge>
                                        ) : (
                                            <Badge variant="outline" className="bg-slate-50 text-slate-600 hover:bg-slate-50 border border-slate-200 px-3 py-1">
                                                Free Tier
                                            </Badge>
                                        )}
                                    </div>
                                </CardHeader>
                                <div className="h-px bg-slate-100 dark:bg-slate-800/50 w-full" />
                                <CardContent className="p-6 md:p-8 bg-white dark:bg-[#0d1425]">

                                    {/* Status Box */}
                                    <div className={`p-6 rounded-2xl border ${isPro
                                        ? 'bg-blue-50/50 border-blue-100 dark:bg-blue-900/10 dark:border-blue-900/30 relative overflow-hidden'
                                        : 'bg-slate-50 border-slate-100 dark:bg-slate-900/50 dark:border-slate-800'
                                        }`}>
                                        {isPro && (
                                            <div className="absolute right-0 top-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
                                        )}
                                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                                            <div className="flex items-center gap-4">
                                                <div className={`h-12 w-12 rounded-xl flex items-center justify-center shrink-0 ${isPro ? 'bg-blue-600 shadow-md shadow-blue-600/20' : 'bg-slate-200 dark:bg-slate-800'}`}>
                                                    {isPro ? <Zap className="h-6 w-6 text-white" /> : <CreditCard className="h-6 w-6 text-slate-500" />}
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-xl">{isPro ? 'Pro Subscription' : 'Hobby Plan'}</h3>
                                                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                                                        {isPro
                                                            ? `Your subscription is active and will renew on ${profile?.subscription_ends_at ? new Date(profile.subscription_ends_at).toLocaleDateString() : 'N/A'}`
                                                            : 'Limited practice questions and basic feedback.'
                                                        }
                                                    </p>
                                                </div>
                                            </div>

                                            <Button
                                                onClick={handleManageSubscription}
                                                disabled={updating}
                                                className={`rounded-full shadow-sm shrink-0 w-full md:w-auto ${isPro
                                                    ? 'bg-white text-slate-900 hover:bg-slate-50 border border-slate-200 dark:bg-slate-900 dark:text-white dark:border-slate-700 dark:hover:bg-slate-800'
                                                    : 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-500/25'
                                                    }`}
                                            >
                                                {updating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                                {isPro ? 'Manage Billing' : 'Upgrade to Pro'}
                                                {!isPro && <ArrowRight className="h-4 w-4 ml-1.5" />}
                                            </Button>
                                        </div>
                                    </div>

                                    {/* Upgrade CTA for Free users */}
                                    {!isPro && (
                                        <div className="mt-8 grid md:grid-cols-2 gap-6 items-center bg-gradient-to-r from-slate-900 to-indigo-950 rounded-2xl p-6 md:p-8 text-white relative overflow-hidden shadow-xl">
                                            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
                                            <div className="relative z-10 space-y-4">
                                                <Badge className="bg-blue-600 hover:bg-blue-600 text-white border-0">Unlock Potential</Badge>
                                                <h4 className="text-2xl font-bold tracking-tight">Ready to ace that interview?</h4>
                                                <p className="text-slate-300 text-sm leading-relaxed max-w-sm">
                                                    Get unlimited voice interviews, hyper-detailed AI feedback, and custom job-tailored paths.
                                                </p>
                                            </div>
                                            <div className="relative z-10 flex flex-col items-start md:items-end justify-center space-y-3">
                                                <div className="flex items-baseline gap-1">
                                                    <span className="text-4xl font-black">$79</span>
                                                    <span className="text-blue-300/80 font-medium">/year</span>
                                                </div>
                                                <Button
                                                    onClick={handleManageSubscription}
                                                    className="w-full md:w-auto rounded-full bg-white text-slate-900 hover:bg-slate-100 font-bold px-8 h-12 shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)]"
                                                >
                                                    <Sparkles className="h-4 w-4 mr-2 text-blue-600" />
                                                    Get Pro Access
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
