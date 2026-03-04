import { PricingPlan } from '@/components/PricingPlan';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export const metadata = {
    title: 'Planlar ve Fiyatlar | LinkedIn Interview Coach',
    description: 'Mülakat koçluğu uygulamasında size uygun planı seçerek kariyerinizi geliştirin.',
};

export default function PricingPage() {
    return (
        <div className="container mx-auto px-4 py-16">
            <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white transition-colors mb-8 group"
            >
                <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
                Dashboard&apos;a Dön
            </Link>

            <div className="max-w-3xl mx-auto text-center mb-12">
                <h1 className="text-4xl font-extrabold tracking-tight mb-4">Size Uygun Planı Seçin</h1>
                <p className="text-lg text-muted-foreground">
                    Kariyerinizde bir sonraki adımı atmak için ihtiyacınız olan tüm araçlar tek bir yerde.
                </p>
            </div>

            <PricingPlan />
        </div>
    );
}
