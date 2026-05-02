-- Phase 7: admin-managed portfolio collections + images.

create table public.portfolio_collections (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  eyebrow text,
  summary text,
  cover_image_key text,
  cover_image_alt text,
  order_index int not null default 0,
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.portfolio_items (
  id uuid primary key default gen_random_uuid(),
  collection_id uuid not null references public.portfolio_collections(id) on delete cascade,
  r2_key text not null,
  file_name text,
  size_bytes bigint,
  content_type text,
  alt text,
  orientation text not null default 'landscape' check (orientation in ('portrait', 'landscape', 'square')),
  order_index int not null default 0,
  created_at timestamptz not null default now()
);

create index portfolio_collections_order_idx
  on public.portfolio_collections (published desc, order_index, created_at desc);
create index portfolio_items_collection_idx
  on public.portfolio_items (collection_id, order_index, created_at desc);

alter table public.portfolio_collections enable row level security;
alter table public.portfolio_items enable row level security;

create policy "portfolio_collections_public_read_published"
  on public.portfolio_collections for select
  to anon, authenticated
  using (published = true);

create policy "portfolio_collections_staff_all"
  on public.portfolio_collections for all
  to authenticated
  using (public.current_user_role() in ('photographer', 'super_admin'))
  with check (public.current_user_role() in ('photographer', 'super_admin'));

create policy "portfolio_items_public_read_published_collection"
  on public.portfolio_items for select
  to anon, authenticated
  using (
    exists (
      select 1
      from public.portfolio_collections c
      where c.id = collection_id
        and c.published = true
    )
  );

create policy "portfolio_items_staff_all"
  on public.portfolio_items for all
  to authenticated
  using (public.current_user_role() in ('photographer', 'super_admin'))
  with check (public.current_user_role() in ('photographer', 'super_admin'));
