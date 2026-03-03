import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Get the oldest unshown payment_success event for the logged-in user
        // @ts-ignore
        const { data, error } = await supabase
            .from('billing_events')
            .select('*')
            .eq('user_id', user.id)
            .eq('type', 'payment_success')
            .is('shown_at', null)
            .order('created_at', { ascending: true })
            .limit(1)
            .single();

        // Single might return error code PGRST116 if no rows found
        if (error && error.code !== 'PGRST116') {
            throw error;
        }

        if (!data) {
            return NextResponse.json({ event: null });
        }

        return NextResponse.json({ event: data });
    } catch (error: any) {
        console.error('Error fetching unshown billing events:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
