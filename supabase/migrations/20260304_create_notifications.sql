-- Create notifications table for in-app notifications
create table if not exists public.notifications (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references auth.users(id) on delete cascade not null,
    title text not null,
    message text not null,
    type text default 'info' check (type in ('info', 'success', 'warning', 'achievement')),
    read boolean default false,
    link text,
    created_at timestamptz default now()
);

-- Index for fast user queries
create index if not exists idx_notifications_user_id on public.notifications(user_id);
create index if not exists idx_notifications_unread on public.notifications(user_id, read) where read = false;

-- Enable RLS
alter table public.notifications enable row level security;

-- Users can only see their own notifications
create policy "Users can view own notifications"
    on public.notifications for select
    using (auth.uid() = user_id);

-- Users can update (mark as read) their own notifications
create policy "Users can update own notifications"
    on public.notifications for update
    using (auth.uid() = user_id);

-- Service role can insert notifications (for system triggers)
create policy "Service can insert notifications"
    on public.notifications for insert
    with check (true);
