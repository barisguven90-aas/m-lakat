'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';

export function PricingPlan() {
    const [isLoading, setIsLoading] = useState<string | null>(null);
    const [isPro, setIsPro] = useState(false);
    const [currentPlan, setCurrentPlan] = useState<'monthly' | 'yearly' | null>(null);
    const router = useRouter();

    const monthlyPriceId = process.env.NEXT_PUBLIC_STRIPE_MONTHLY_PRICE_ID;
    const yearlyPriceId = process.env.NEXT_PUBLIC_STRIPE_YEARLY_PRICE_ID;

    useEffect(() => {
        const fetchStatus = async () => {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data } = await supabase.from('profiles').select('subscription_status, stripe_price_id').eq('id', user.id).single();
                if (data?.subscription_status === 'active' || data?.subscription_status === 'trialing') {
                    setIsPro(true);
                    if (data.stripe_price_id === monthlyPriceId) {
                        setCurrentPlan('monthly');
                    } else if (data.stripe_price_id === yearlyPriceId) {
                        setCurrentPlan('yearly');
                    } else {
                        setCurrentPlan('monthly');
                    }
                }
            }
        };
        fetchStatus();
    }, [monthlyPriceId, yearlyPriceId]);

    const handleManageSubscription = async () => {
        try {
            setIsLoading('manage');
            const res = await fetch('/api/stripe/portal', { method: 'POST' });
            const { url } = await res.json();
            if (url) {
                window.location.href = url;
            } else {
                toast.error("Billing portal error.");
            }
        } catch (error) {
            toast.error("Failed to redirect to billing portal.");
        } finally {
            setIsLoading(null);
        }
    };

    const handleSubscribe = async (priceId: string | undefined, plan: string) => {
        if (!priceId) {
            toast.error('Ödeme planı henüz ayarlanmamış.');
            return;
        }

        try {
            setIsLoading(plan);
            const res = await fetch('/api/stripe/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ priceId }),
            });

            const data = await res.json();
            if (!res.ok) {
                throw new Error(data?.message || data?.error || 'Ödeme başlatılamadı');
            }
            if (data.url) {
                window.location.href = data.url;
            }
        } catch (error: any) {
            console.error('Checkout error:', error);
            toast.error(error.message || 'Ödeme işlemi başlatılırken hata oluştu.');
        } finally {
            setIsLoading(null);
        }
    };

    const isMonthly = isPro && currentPlan === 'monthly';
    const isYearly = isPro && currentPlan === 'yearly';

    return (
        <div className="flex flex-col md:flex-row gap-8 justify-center items-center py-12">
            {/* Monthly Plan */}
            <Card className={`w-full max-w-sm flex flex-col items-center p-6 border-zinc-200 shadow-sm transition-shadow relative ${isYearly ? 'opacity-60' : 'hover:shadow-md'} ${isMonthly ? 'border-blue-500 shadow-xl' : ''}`}>
                {isMonthly && <Badge className="absolute -top-3 right-8 bg-blue-600 hover:bg-blue-700 text-white">Mevcut Plan</Badge>}
                <CardHeader className="text-center w-full">
                    <CardTitle className="text-2xl font-bold">Aylık Plan</CardTitle>
                    <CardDescription>Esnek kullanım için ideal</CardDescription>
                </CardHeader>
                <CardContent className="w-full text-center flex-grow">
                    <div className="my-4">
                        <span className="text-5xl font-extrabold">$12</span>
                        <span className="text-zinc-500 font-medium">/ay</span>
                    </div>
                    <ul className="space-y-3 text-left mt-8 w-full mx-auto">
                        <li className="flex items-center gap-2"><Check className="h-5 w-5 text-green-500 flex-shrink-0" /> Ayda 10 mülakat pratiği</li>
                        <li className="flex items-center gap-2"><Check className="h-5 w-5 text-green-500 flex-shrink-0" /> Google Cloud Premium Sesler</li>
                        <li className="flex items-center gap-2"><Check className="h-5 w-5 text-green-500 flex-shrink-0" /> Detaylı geri bildirim</li>
                    </ul>
                </CardContent>
                <CardFooter className="w-full mt-auto">
                    {isMonthly ? (
                        <Button
                            className="w-full bg-green-50 text-green-700 hover:bg-green-100 border border-green-200 shadow-sm"
                            onClick={handleManageSubscription}
                            disabled={isLoading !== null}
                        >
                            {isLoading === 'manage' ? 'Yönlendiriliyor...' : 'Mevcut Planınız (Yönet)'}
                        </Button>
                    ) : isYearly ? (
                        <Button className="w-full bg-slate-100 text-slate-400 cursor-not-allowed border-0" disabled>
                            Yıllık Plan Kapsıyor
                        </Button>
                    ) : (
                        <Button
                            className="w-full"
                            variant="outline"
                            onClick={() => handleSubscribe(monthlyPriceId, 'monthly')}
                            disabled={isLoading !== null}
                        >
                            {isLoading === 'monthly' ? 'Yönlendiriliyor...' : 'Aylık Başla'}
                        </Button>
                    )}
                </CardFooter>
            </Card>

            {/* Yearly Plan */}
            <Card className={`w-full max-w-sm flex flex-col items-center p-6 shadow-xl relative scale-100 md:scale-105 ${isYearly ? 'border-blue-500' : isMonthly ? 'border-zinc-200 opacity-80' : 'border-blue-500'}`}>
                {!isMonthly && <Badge className="absolute -top-3 right-8 bg-blue-600 hover:bg-blue-700 text-white">{isYearly ? 'Mevcut Plan' : 'En Popüler'}</Badge>}
                <CardHeader className="text-center w-full">
                    <CardTitle className="text-2xl font-bold text-blue-600">Yıllık Plan</CardTitle>
                    <CardDescription>Uzun vadeli gelişim için</CardDescription>
                </CardHeader>
                <CardContent className="w-full text-center flex-grow">
                    <div className="my-4">
                        <span className="text-5xl font-extrabold">$79</span>
                        <span className="text-zinc-500 font-medium">/yıl</span>
                    </div>
                    <ul className="space-y-3 text-left mt-8 w-full mx-auto">
                        <li className="flex items-center gap-2 font-medium"><Check className="h-5 w-5 text-green-500 flex-shrink-0" /> Aylık plana göre ~%45 tasarruf</li>
                        <li className="flex items-center gap-2"><Check className="h-5 w-5 text-green-500 flex-shrink-0" /> Ayda 20 mülakat pratiği</li>
                        <li className="flex items-center gap-2"><Check className="h-5 w-5 text-green-500 flex-shrink-0" /> Öncelikli Google Cloud Sunucusu</li>
                        <li className="flex items-center gap-2"><Check className="h-5 w-5 text-green-500 flex-shrink-0" /> Mülakat Geçmişi ve Karne Analizi</li>
                    </ul>
                </CardContent>
                <CardFooter className="w-full mt-auto">
                    {isYearly ? (
                        <Button
                            className="w-full bg-green-50 text-green-700 hover:bg-green-100 border border-green-200 shadow-sm"
                            onClick={handleManageSubscription}
                            disabled={isLoading !== null}
                        >
                            {isLoading === 'manage' ? 'Yönlendiriliyor...' : 'Mevcut Planınız (Yönet)'}
                        </Button>
                    ) : isMonthly ? (
                        <Button
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                            onClick={() => handleSubscribe(yearlyPriceId, 'yearly')}
                            disabled={isLoading !== null}
                        >
                            {isLoading === 'yearly' ? 'Yönlendiriliyor...' : 'Yıllık Plana Yükselt'}
                        </Button>
                    ) : (
                        <Button
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                            onClick={() => handleSubscribe(yearlyPriceId, 'yearly')}
                            disabled={isLoading !== null}
                        >
                            {isLoading === 'yearly' ? 'Yönlendiriliyor...' : 'Yıllık Başla'}
                        </Button>
                    )}
                </CardFooter>
            </Card>
        </div>
    );
}
