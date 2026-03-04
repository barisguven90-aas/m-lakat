import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    const { count } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('read', false);

    return NextResponse.json({ notifications: data || [], unreadCount: count || 0 });
}

export async function PATCH(request: Request) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id, markAllRead } = await request.json();

    if (markAllRead) {
        await supabase
            .from('notifications')
            .update({ read: true })
            .eq('user_id', user.id)
            .eq('read', false);
    } else if (id) {
        await supabase
            .from('notifications')
            .update({ read: true })
            .eq('id', id)
            .eq('user_id', user.id);
    }

    return NextResponse.json({ success: true });
}
