'use client';

import { useState } from 'react';
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

export function PricingPlan() {
    const [isLoading, setIsLoading] = useState<string | null>(null);

    const handleSubscribe = async (priceId: string | undefined, plan: string) => {
        if (!priceId) {
            toast.error('Ödeme planı henüz ayarlanmamış.');
            return;
        }

        try {
            setIsLoading(plan);
            const res = await fetch('/api/stripe/checkout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ priceId }),
            });

            if (!res.ok) {
                throw new Error('Ödeme başlatılamadı');
            }

            const data = await res.json();
            if (data.url) {
                window.location.href = data.url;
            }
        } catch (error) {
            console.error('Checkout error:', error);
            toast.error('Ödeme işlemi başlatılırken hata oluştu.');
        } finally {
            setIsLoading(null);
        }
    };

    const monthlyPriceId = process.env.NEXT_PUBLIC_STRIPE_MONTHLY_PRICE_ID;
    const yearlyPriceId = process.env.NEXT_PUBLIC_STRIPE_YEARLY_PRICE_ID;

    return (
        <div className="flex flex-col md:flex-row gap-8 justify-center items-center py-12">
            {/* Monthly Plan */}
            <Card className="w-full max-w-sm flex flex-col items-center p-6 border-zinc-200 shadow-sm hover:shadow-md transition-shadow">
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
                        <li className="flex items-center gap-2"><Check className="h-5 w-5 text-green-500 flex-shrink-0" /> Sınırsız mülakat pratiği</li>
                        <li className="flex items-center gap-2"><Check className="h-5 w-5 text-green-500 flex-shrink-0" /> Detaylı geri bildirim</li>
                        <li className="flex items-center gap-2"><Check className="h-5 w-5 text-green-500 flex-shrink-0" /> Profilden analiz</li>
                    </ul>
                </CardContent>
                <CardFooter className="w-full mt-auto">
                    <Button
                        className="w-full"
                        variant="outline"
                        onClick={() => handleSubscribe(monthlyPriceId, 'monthly')}
                        disabled={isLoading !== null}
                    >
                        {isLoading === 'monthly' ? 'Yönlendiriliyor...' : 'Aylık Başla'}
                    </Button>
                </CardFooter>
            </Card>

            {/* Yearly Plan */}
            <Card className="w-full max-w-sm flex flex-col items-center p-6 border-blue-500 shadow-xl relative scale-100 md:scale-105">
                <Badge className="absolute -top-3 right-8 bg-blue-600 hover:bg-blue-700 text-white">En Popüler</Badge>
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
                        <li className="flex items-center gap-2"><Check className="h-5 w-5 text-green-500 flex-shrink-0" /> Sınırsız mülakat pratiği</li>
                        <li className="flex items-center gap-2"><Check className="h-5 w-5 text-green-500 flex-shrink-0" /> Detaylı geri bildirim</li>
                        <li className="flex items-center gap-2"><Check className="h-5 w-5 text-green-500 flex-shrink-0" /> Premium destek</li>
                    </ul>
                </CardContent>
                <CardFooter className="w-full mt-auto">
                    <Button
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                        onClick={() => handleSubscribe(yearlyPriceId, 'yearly')}
                        disabled={isLoading !== null}
                    >
                        {isLoading === 'yearly' ? 'Yönlendiriliyor...' : 'Yıllık Başla'}
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}
