import { PricingPlan } from '@/components/PricingPlan';

export const metadata = {
    title: 'Planlar ve Fiyatlar | LinkedIn Interview Coach',
    description: 'Mülakat koçluğu uygulamasında size uygun planı seçerek kariyerinizi geliştirin.',
};

export default function PricingPage() {
    return (
        <div className="container mx-auto px-4 py-16">
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
