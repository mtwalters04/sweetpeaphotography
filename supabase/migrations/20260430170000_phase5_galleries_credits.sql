-- Phase 5: gallery_items, credit_ledger, email_log.

create type public.gallery_kind as enum ('original', 'web', 'delivery_zip');

create table public.gallery_items (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings(id) on delete cascade,
  r2_key text not null,
  file_name text,
  size_bytes bigint,
  content_type text,
  kind public.gallery_kind not null default 'web',
  order_index int not null default 0,
  created_at timestamptz not null default now()
);

create index gallery_items_booking_idx on public.gallery_items (booking_id, kind, order_index);

create table public.credit_ledger (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.profiles(id) on delete cascade,
  amount_cents int not null,        -- positive = issued, negative = applied
  reason text not null,             -- 'customer_cancel_48h+', 'studio_cancel', 'manual', 'applied_to_booking'
  booking_id uuid references public.bookings(id) on delete set null,
  issued_by uuid references public.profiles(id) on delete set null,
  notes text,
  created_at timestamptz not null default now()
);

create index credit_ledger_customer_idx on public.credit_ledger (customer_id, created_at desc);

-- Helper view for current balance per customer.
create or replace view public.credit_balances as
  select customer_id, coalesce(sum(amount_cents), 0) as balance_cents
  from public.credit_ledger
  group by customer_id;

create table public.email_log (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid references public.bookings(id) on delete set null,
  request_id uuid references public.custom_requests(id) on delete set null,
  to_email text not null,
  subject text not null,
  template text not null,
  resend_id text,
  error text,
  sent_at timestamptz not null default now()
);

create index email_log_sent_at_idx on public.email_log (sent_at desc);

-- RLS
alter table public.gallery_items enable row level security;
alter table public.credit_ledger enable row level security;
alter table public.email_log enable row level security;

-- gallery_items: customer can read items belonging to their bookings.
create policy "gallery_customer_select"
  on public.gallery_items for select
  to authenticated
  using (
    exists (
      select 1 from public.bookings b
      where b.id = booking_id and b.customer_id = auth.uid()
    )
  );

create policy "gallery_staff_all"
  on public.gallery_items for all
  to authenticated
  using (public.current_user_role() in ('photographer', 'super_admin'))
  with check (public.current_user_role() in ('photographer', 'super_admin'));

-- credit_ledger: customer can read own. Staff can read+write all.
create policy "credits_customer_select_own"
  on public.credit_ledger for select
  to authenticated
  using (customer_id = auth.uid());

create policy "credits_staff_all"
  on public.credit_ledger for all
  to authenticated
  using (public.current_user_role() in ('photographer', 'super_admin'))
  with check (public.current_user_role() in ('photographer', 'super_admin'));

-- email_log: staff only.
create policy "email_log_staff_all"
  on public.email_log for all
  to authenticated
  using (public.current_user_role() in ('photographer', 'super_admin'))
  with check (public.current_user_role() in ('photographer', 'super_admin'));
