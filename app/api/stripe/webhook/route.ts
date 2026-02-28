import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

// Use Admin client for Webhook actions (bypass RLS)
const getSupabase = () => createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321', // Fallback for build phase
    process.env.SUPABASE_SERVICE_ROLE_KEY || 'dummy_key'
);

const getStripe = () => new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_123', {
    apiVersion: '2025-02-24.acacia' as any,
});

export async function POST(req: Request) {
    const supabase = getSupabase();
    const stripe = getStripe();
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || 'whsec_dummy';
    const body = await req.text();
    // In Next.js 15+ headers() is async/awaitable, but in 14 it's sync. Assuming sync for now or check version.
    // Next 16 might require await.
    const signature = (await headers()).get('stripe-signature');

    if (!signature) {
        return NextResponse.json({ error: 'Missing stripe-signature' }, { status: 400 });
    }

    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err: any) {
        console.error(`Webhook Error: ${err.message}`);
        return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
    }

    try {
        switch (event.type) {
            case 'checkout.session.completed': {
                const session = event.data.object as Stripe.Checkout.Session;
                // Handle successful subscription creation
                // Usually 'customer.subscription.created' handles the DB logic, but we can verify here.
                break;
            }
            case 'customer.subscription.created':
            case 'customer.subscription.updated':
            case 'customer.subscription.deleted': {
                const subscription = event.data.object as any;

                const userId = subscription.metadata?.supabaseUUID; // Ensure metadata was passed during creation

                // If userId is missing from subscription metadata (it often is unless propagated),
                // retrieve customer and check metadata there.
                let targetUserId = userId;
                if (!userId) {
                    const customer = await stripe.customers.retrieve(subscription.customer as string) as Stripe.Customer;
                    targetUserId = customer.metadata?.supabaseUUID;
                }

                if (targetUserId) {
                    await supabase.from('profiles').update({
                        subscription_status: subscription.status,
                        subscription_ends_at: new Date(subscription.current_period_end * 1000).toISOString()
                    }).eq('id', targetUserId);
                }
                break;
            }
        }
        return NextResponse.json({ received: true });
    } catch (error) {
        console.error('Webhook Handler Error:', error);
        return NextResponse.json({ error: 'Webhook Handler Failed' }, { status: 500 });
    }
}
