create table public.push_subscriptions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users on delete cascade,
  endpoint text not null,
  p256dh text not null,
  auth_key text not null,
  created_at timestamptz default now() not null,
  unique(user_id, endpoint)
);

create table public.notification_preferences (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users on delete cascade unique,
  enabled boolean not null default true,
  schedule_type text not null default 'fixed_days' check (schedule_type in ('fixed_days', 'days_since_workout')),
  fixed_days int[] default '{1,3,5}', -- 0=Sun, 1=Mon, ..., 6=Sat
  days_interval int default 2, -- remind if no workout in X days
  reminder_hour int not null default 9, -- hour in UTC to send reminder
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

alter table public.push_subscriptions enable row level security;
alter table public.notification_preferences enable row level security;

create policy "Users can manage own subscriptions" on public.push_subscriptions for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users can manage own preferences" on public.notification_preferences for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
