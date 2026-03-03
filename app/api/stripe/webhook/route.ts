import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { stripe } from '@/lib/stripe';
import { createClient } from '@supabase/supabase-js';

// Using Supabase Admin Client to bypass RLS for webhook operations
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321',
    process.env.SUPABASE_SERVICE_ROLE_KEY || 'dummy_key'
);

export async function POST(req: Request) {
    const body = await req.text();
    const headersList = await headers();
    const signature = headersList.get('stripe-signature') as string;

    if (!signature) {
        return new NextResponse('Missing stripe-signature', { status: 400 });
    }

    let event;

    try {
        event = stripe.webhooks.constructEvent(
            body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET_NEW || process.env.STRIPE_WEBHOOK_SECRET || 'whsec_dummy'
        );
    } catch (error: any) {
        console.error('Webhook Error:', error.message);
        return new NextResponse(`Webhook Error: ${error.message}`, { status: 400 });
    }

    const session = event.data.object as any;

    try {
        switch (event.type) {
            case 'checkout.session.completed': {
                if (session.mode === 'subscription') {
                    const sub = await stripe.subscriptions.retrieve(
                        session.subscription as string
                    ) as any;

                    let userId = session.metadata?.userId;
                    if (!userId) {
                        const customer = await stripe.customers.retrieve(sub.customer as string) as any;
                        userId = customer.metadata?.supabaseUUID;
                    }

                    if (userId) {
                        await supabaseAdmin
                            .from('profiles' as any)
                            .update({
                                stripe_subscription_id: sub.id,
                                stripe_customer_id: sub.customer as string,
                                stripe_price_id: sub.items.data[0].price.id,
                                // @ts-ignore
                                stripe_current_period_end: new Date(sub.current_period_end * 1000).toISOString(),
                                subscription_status: sub.status,
                            } as any)
                            .eq('id', userId);

                        // Insert into billing_events for Payment Success modal
                        // @ts-ignore: generic table insert bypass 
                        await supabaseAdmin.from('billing_events').insert({
                            user_id: userId,
                            stripe_event_id: event.id,
                            type: 'payment_success',
                            payload_json: {
                                plan_name: sub.items.data[0].price.id === process.env.NEXT_PUBLIC_STRIPE_YEARLY_PRICE_ID ? 'Intervio Pro — Annual' : 'Intervio Pro — Monthly',
                                status: sub.status,
                                // @ts-ignore
                                current_period_end: new Date(sub.current_period_end * 1000).toISOString()
                            }
                        });
                    }
                }
            }
            case 'customer.subscription.updated':
            case 'customer.subscription.deleted': {
                const sub = event.data.object as any;

                // Find user by customer ID
                const { data: profile } = await supabaseAdmin
                    .from('profiles')
                    .select('id')
                    .eq('stripe_customer_id', sub.customer)
                    .single();

                if (profile) {
                    await supabaseAdmin
                        .from('profiles' as any)
                        .update({
                            stripe_price_id: sub.items.data[0].price.id,
                            // @ts-ignore: bypass strict type checking for current_period_end on stripe subscription
                            stripe_current_period_end: new Date(sub.current_period_end * 1000).toISOString(),
                            subscription_status: sub.status,
                        } as any)
                        .eq('id', profile.id);
                }
                break;
            }
        }
    } catch (error: any) {
        console.error('Database Update Error:', error);
        return new NextResponse('Webhook handler failed. ' + error.message, { status: 500 });
    }

    return new NextResponse('Webhook OK', { status: 200 });
}
