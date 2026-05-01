-- Phase 4: custom_requests + request_messages.

create type public.request_status as enum (
  'pending',
  'quoted',
  'accepted',
  'declined',
  'withdrawn',
  'converted'
);

create type public.photographer_pref as enum ('a', 'b', 'either', 'none');

create table public.custom_requests (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.profiles(id) on delete cascade,
  preferred_date date,
  preferred_time time,
  preferred_session_type_slug text,
  photographer_pref public.photographer_pref not null default 'either',
  location_hint text,
  message text not null,
  reference_image_keys text[] not null default '{}',

  status public.request_status not null default 'pending',
  quote_amount_cents int,
  quote_message text,
  quoted_at timestamptz,
  quote_slot_id uuid references public.available_slots(id) on delete set null,
  declined_reason text,
  accepted_at timestamptz,
  declined_at timestamptz,
  withdrawn_at timestamptz,
  converted_at timestamptz,

  assigned_admin_id uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Wire requests back to slots for convenience.
alter table public.available_slots
  add column private_request_id uuid references public.custom_requests(id) on delete set null;

create index requests_status_idx on public.custom_requests (status, created_at desc);
create index requests_customer_idx on public.custom_requests (customer_id, created_at desc);

create trigger requests_touch
  before update on public.custom_requests
  for each row execute function public.touch_updated_at();

create table public.request_messages (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.custom_requests(id) on delete cascade,
  author_id uuid references public.profiles(id) on delete set null,
  body text not null,
  internal boolean not null default false,
  created_at timestamptz not null default now()
);

create index request_messages_thread_idx on public.request_messages (request_id, created_at);

-- RLS
alter table public.custom_requests enable row level security;
alter table public.request_messages enable row level security;

create policy "requests_customer_select_own"
  on public.custom_requests for select
  to authenticated
  using (customer_id = auth.uid());

create policy "requests_customer_insert"
  on public.custom_requests for insert
  to authenticated
  with check (customer_id = auth.uid() and status = 'pending');

-- Customer can only update to 'withdrawn' on their own pending/quoted requests.
create policy "requests_customer_withdraw"
  on public.custom_requests for update
  to authenticated
  using (customer_id = auth.uid() and status in ('pending', 'quoted'))
  with check (customer_id = auth.uid() and status = 'withdrawn');

create policy "requests_staff_all"
  on public.custom_requests for all
  to authenticated
  using (public.current_user_role() in ('photographer', 'super_admin'))
  with check (public.current_user_role() in ('photographer', 'super_admin'));

-- request_messages: customer sees non-internal messages on their requests; staff sees all.
create policy "request_messages_customer_select"
  on public.request_messages for select
  to authenticated
  using (
    not internal and exists (
      select 1 from public.custom_requests r
      where r.id = request_id and r.customer_id = auth.uid()
    )
  );

create policy "request_messages_customer_insert"
  on public.request_messages for insert
  to authenticated
  with check (
    not internal and exists (
      select 1 from public.custom_requests r
      where r.id = request_id and r.customer_id = auth.uid()
    )
    and author_id = auth.uid()
  );

create policy "request_messages_staff_all"
  on public.request_messages for all
  to authenticated
  using (public.current_user_role() in ('photographer', 'super_admin'))
  with check (public.current_user_role() in ('photographer', 'super_admin'));
