-- Phase 6: CRM fields on profiles, testimonials.

create type public.lifecycle_stage as enum ('lead', 'active', 'past_client', 'dormant');

alter table public.profiles
  add column lifecycle_stage public.lifecycle_stage,
  add column tags text[] not null default '{}',
  add column last_contact_at timestamptz,
  add column internal_notes text;

create index profiles_lifecycle_idx on public.profiles (lifecycle_stage);
create index profiles_tags_idx on public.profiles using gin (tags);

create table public.testimonials (
  id uuid primary key default gen_random_uuid(),
  quote text not null,
  attribution text not null,
  context text,
  featured boolean not null default false,
  approved boolean not null default false,
  order_index int not null default 0,
  booking_id uuid references public.bookings(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index testimonials_published_idx on public.testimonials (approved, featured, order_index);

create trigger testimonials_touch
  before update on public.testimonials
  for each row execute function public.touch_updated_at();

-- RLS
alter table public.testimonials enable row level security;

create policy "testimonials_public_select_approved"
  on public.testimonials for select
  to anon, authenticated
  using (approved = true);

create policy "testimonials_staff_all"
  on public.testimonials for all
  to authenticated
  using (public.current_user_role() in ('photographer', 'super_admin'))
  with check (public.current_user_role() in ('photographer', 'super_admin'));
