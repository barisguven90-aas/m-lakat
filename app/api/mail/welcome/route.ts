import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { sendWelcomeEmail } from '@/lib/mail/flows';

export async function POST(request: Request) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: profile } = await supabase.from('profiles').select('welcome_email_sent_at, full_name, email, language').eq('id', user.id).single();
    if (!profile) return NextResponse.json({ error: 'No profile' }, { status: 404 });
    
    if (profile.welcome_email_sent_at) {
        return NextResponse.json({ success: true, message: 'Already sent' });
    }

    try {
        const targetEmail = profile.email || user.email;
        if (!targetEmail) throw new Error("No email found");
        
        await sendWelcomeEmail(targetEmail, profile.full_name || '', profile.language || 'en');
        await supabase.from('profiles').update({ welcome_email_sent_at: new Date().toISOString() }).eq('id', user.id);
        return NextResponse.json({ success: true });
    } catch (e: any) {
        console.error('Welcome email error:', e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
