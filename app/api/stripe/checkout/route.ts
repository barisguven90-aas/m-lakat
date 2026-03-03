import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const priceId = body.priceId;

        if (!priceId) {
            return NextResponse.json({ error: 'Price ID is required' }, { status: 400 });
        }

        if (!process.env.STRIPE_SECRET_KEY) {
            return NextResponse.json({
                error: 'Stripe Config Error',
                message: 'Stripe Secret Key eksik. Lütfen Vercel paneline STRIPE_SECRET_KEY değerini girdiğinizden emin olun.'
            }, { status: 500 });
        }

        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Attempt to get user profile to check if they already have a stripe customer id
        const { data: profile } = await supabase
            .from('profiles')
            .select('stripe_customer_id')
            .eq('id', user.id)
            .single();

        let customerId = profile?.stripe_customer_id;

        if (!customerId) {
            // Create a new Customer in Stripe
            const customer = await stripe.customers.create({
                email: user.email,
                metadata: {
                    supabaseUUID: user.id
                }
            });
            customerId = customer.id;

            // Optional: Wait for webhook to update profile, but using customerId directly here for checkout
        }

        const origin = req.headers.get('origin');
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || origin || 'https://intervioai.com';

        const checkoutSession = await stripe.checkout.sessions.create({
            customer: customerId,
            mode: 'subscription',
            payment_method_types: ['card'],
            line_items: [
                {
                    price: priceId,
                    quantity: 1,
                },
            ],
            success_url: `${appUrl}/dashboard?session_id={CHECKOUT_SESSION_ID}&success=true`,
            cancel_url: `${appUrl}/pricing?canceled=true`,
            metadata: {
                userId: user.id,
            },
        });

        return NextResponse.json({ url: checkoutSession.url });
    } catch (error: any) {
        console.error('[STRIPE_CHECKOUT_ERROR]', error);
        return new NextResponse(
            JSON.stringify({
                error: 'Internal Error',
                message: error.message || 'Unknown error occurred during checkout initialization.'
            }),
            {
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            }
        );
    }
}
