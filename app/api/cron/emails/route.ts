import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { sendActivationEmail, sendReengagementEmail } from '@/lib/mail/flows';

export async function GET(request: Request) {
    // For Vercel Cron, you would typically check a secret header:
    const authHeader = request.headers.get('authorization');
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const supabase = await createAdminClient();
        
        // --- 1. ACTIVATION EMAIL (24h after signup, if no interviews) ---
        // Fetch users created > 24h ago but < 48h ago, where activation_email_sent_at is null
        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
        const fortyEightHoursAgo = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();

        const { data: usersForActivation } = await supabase
            .from('profiles')
            .select('id, email, full_name')
            .is('activation_email_sent_at', null)
            .lt('created_at', twentyFourHoursAgo)
            .gt('created_at', fortyEightHoursAgo);

        if (usersForActivation) {
            for (const profile of usersForActivation) {
                // Check if they have started an interview
                const { count } = await supabase
                    .from('interview_sessions')
                    .select('*', { count: 'exact', head: true })
                    .eq('user_id', profile.id);
                
                if (count === 0 && profile.email) {
                    await sendActivationEmail(profile.email, profile.full_name || '');
                    await supabase.from('profiles').update({ activation_email_sent_at: new Date().toISOString() }).eq('id', profile.id);
                }
            }
        }

        // --- 2. RE-ENGAGEMENT EMAIL (7 days after signup, if < 2 interviews) ---
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
        const eightDaysAgo = new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString();

        const { data: usersForReengagement } = await supabase
            .from('profiles')
            .select('id, email, full_name')
            .is('reengagement_email_sent_at', null)
            .lt('created_at', sevenDaysAgo)
            .gt('created_at', eightDaysAgo);

        if (usersForReengagement) {
            for (const profile of usersForReengagement) {
                // Check if they have done < 2 interviews
                const { count } = await supabase
                    .from('interview_sessions')
                    .select('*', { count: 'exact', head: true })
                    .eq('user_id', profile.id);
                
                if (count !== null && count < 2 && profile.email) {
                    await sendReengagementEmail(profile.email, profile.full_name || '');
                    await supabase.from('profiles').update({ reengagement_email_sent_at: new Date().toISOString() }).eq('id', profile.id);
                }
            }
        }

        return NextResponse.json({ success: true, processed: { 
            activationChecked: usersForActivation?.length || 0,
            reengagementChecked: usersForReengagement?.length || 0
        }});

    } catch (e: any) {
        console.error('Cron emails error:', e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
