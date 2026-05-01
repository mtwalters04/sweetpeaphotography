-- Phase 3: photographers, session_types, available_slots, bookings.

create type public.slot_status as enum ('open', 'held', 'booked', 'cancelled');
create type public.pipeline_stage as enum (
  'booked',
  'shoot_scheduled',
  'shoot_complete',
  'editing',
  'delivered',
  'archived',
  'cancelled'
);
create type public.cancelled_by as enum ('customer', 'studio', 'system');

-- Photographers: studio members. May or may not have a profile.
create table public.photographers (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references public.profiles(id) on delete set null,
  public_name text not null,
  public_bio text,
  order_index int not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger photographers_touch
  before update on public.photographers
  for each row execute function public.touch_updated_at();

-- Session types: admin-defined services that drive published slots.
create table public.session_types (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  eyebrow text,
  summary text,
  description text,
  includes text[] not null default '{}',
  duration_minutes int not null default 60,
  starting_at_cents int not null,
  deposit_pct numeric not null default 0.30 check (deposit_pct > 0 and deposit_pct <= 1),
  active boolean not null default true,
  order_index int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger session_types_touch
  before update on public.session_types
  for each row execute function public.touch_updated_at();

-- Available slots: a single calendar entry for a date/time/photographer/type.
create table public.available_slots (
  id uuid primary key default gen_random_uuid(),
  session_type_id uuid not null references public.session_types(id) on delete restrict,
  photographer_id uuid references public.photographers(id) on delete set null,
  starts_at timestamptz not null,
  duration_minutes int not null,
  price_cents int not null,
  location_label text,
  status public.slot_status not null default 'open',
  hold_expires_at timestamptz,
  held_by_user uuid references public.profiles(id) on delete set null,
  private_for_user uuid references public.profiles(id) on delete set null,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index slots_starts_at_idx on public.available_slots (starts_at);
create index slots_status_idx on public.available_slots (status, starts_at);

create trigger slots_touch
  before update on public.available_slots
  for each row execute function public.touch_updated_at();

-- Bookings: one row per confirmed payment. 1:1 with available_slots.
create table public.bookings (
  id uuid primary key default gen_random_uuid(),
  slot_id uuid not null unique references public.available_slots(id) on delete restrict,
  customer_id uuid not null references public.profiles(id) on delete restrict,
  photographer_id uuid references public.photographers(id) on delete set null,
  session_type_id uuid references public.session_types(id) on delete set null,
  starts_at timestamptz not null,
  amount_cents int not null,
  deposit_cents int not null,
  credit_applied_cents int not null default 0,
  stripe_payment_intent_id text,
  stripe_checkout_session_id text unique,
  pipeline_stage public.pipeline_stage not null default 'booked',
  notes text,
  cancelled_at timestamptz,
  cancelled_by public.cancelled_by,
  cancellation_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index bookings_customer_idx on public.bookings (customer_id, created_at desc);
create index bookings_pipeline_idx on public.bookings (pipeline_stage, starts_at);

create trigger bookings_touch
  before update on public.bookings
  for each row execute function public.touch_updated_at();

-- RLS
alter table public.photographers enable row level security;
alter table public.session_types enable row level security;
alter table public.available_slots enable row level security;
alter table public.bookings enable row level security;

-- photographers: public can read (drives /about). Staff can write.
create policy "photographers_public_select"
  on public.photographers for select
  to anon, authenticated
  using (active = true);

create policy "photographers_staff_all"
  on public.photographers for all
  to authenticated
  using (public.current_user_role() in ('photographer', 'super_admin'))
  with check (public.current_user_role() in ('photographer', 'super_admin'));

-- session_types: public can read active, staff can read+write all.
create policy "session_types_public_select_active"
  on public.session_types for select
  to anon, authenticated
  using (active = true);

create policy "session_types_staff_all"
  on public.session_types for all
  to authenticated
  using (public.current_user_role() in ('photographer', 'super_admin'))
  with check (public.current_user_role() in ('photographer', 'super_admin'));

-- available_slots: public sees only 'open' slots that are not private.
create policy "slots_public_select_open"
  on public.available_slots for select
  to anon, authenticated
  using (status = 'open' and private_for_user is null);

-- A signed-in customer can also see their private slot (from a custom-request quote).
create policy "slots_private_owner_select"
  on public.available_slots for select
  to authenticated
  using (private_for_user = auth.uid());

create policy "slots_staff_all"
  on public.available_slots for all
  to authenticated
  using (public.current_user_role() in ('photographer', 'super_admin'))
  with check (public.current_user_role() in ('photographer', 'super_admin'));

-- bookings: customer sees own, staff sees all.
create policy "bookings_customer_select_own"
  on public.bookings for select
  to authenticated
  using (customer_id = auth.uid());

create policy "bookings_staff_all"
  on public.bookings for all
  to authenticated
  using (public.current_user_role() in ('photographer', 'super_admin'))
  with check (public.current_user_role() in ('photographer', 'super_admin'));
