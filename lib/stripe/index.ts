import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
    // Using 'as any' since the exact type might differ based on installed stripe version
    apiVersion: '2025-02-24.acacia' as any,
    appInfo: {
        name: 'LinkedIn Interview Coach AI',
        version: '0.1.0'
    },
    // Fix for "An error occurred with our connection to Stripe" in Next.js Serverless environments
    httpClient: Stripe.createFetchHttpClient()
});
