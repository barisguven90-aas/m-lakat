import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { sendWaitlistEmail } from '@/lib/mail/flows';

export async function POST(request: Request) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: profile } = await supabase.from('profiles').select('pro_waitlist, full_name, email').eq('id', user.id).single();
    if (!profile) return NextResponse.json({ error: 'No profile' }, { status: 404 });

    try {
        const targetEmail = profile.email || user.email;
        if (!targetEmail) throw new Error("No email found");
        
        await sendWaitlistEmail(targetEmail, profile.full_name || '');
        return NextResponse.json({ success: true });
    } catch (e: any) {
        console.error('Waitlist email error:', e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
