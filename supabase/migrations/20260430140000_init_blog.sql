-- Phase 7: Journal (blog) — posts authored by photographers/super_admin.

create type public.post_status as enum ('draft', 'published', 'archived');

create table public.blog_posts (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  dek text,
  body_md text not null default '',
  hero_image_url text,
  hero_image_alt text,
  author_id uuid references public.profiles(id) on delete set null,
  tags text[] not null default '{}',
  related_service_slug text,
  meta_title text,
  meta_description text,
  canonical_url text,
  status public.post_status not null default 'draft',
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index blog_posts_published_idx
  on public.blog_posts (status, published_at desc);

create index blog_posts_tags_idx
  on public.blog_posts using gin (tags);

create trigger blog_posts_touch_updated_at
  before update on public.blog_posts
  for each row execute function public.touch_updated_at();

-- Set published_at the first time status flips to 'published'. Don't overwrite.
create or replace function public.blog_posts_set_published_at()
returns trigger
language plpgsql
as $$
begin
  if new.status = 'published'
     and (old.status is distinct from 'published')
     and new.published_at is null then
    new.published_at = now();
  end if;
  return new;
end;
$$;

create trigger blog_posts_set_published_at_trg
  before update on public.blog_posts
  for each row execute function public.blog_posts_set_published_at();

-- Slugs are immutable once published. Reading from same row inside a BEFORE
-- UPDATE trigger is safe and avoids drifting public URLs.
create or replace function public.blog_posts_lock_slug_after_publish()
returns trigger
language plpgsql
as $$
begin
  if old.status = 'published'
     and new.slug is distinct from old.slug then
    raise exception 'Slug is immutable after publishing';
  end if;
  return new;
end;
$$;

create trigger blog_posts_lock_slug_trg
  before update on public.blog_posts
  for each row execute function public.blog_posts_lock_slug_after_publish();

-- RLS
alter table public.blog_posts enable row level security;

-- Public reads: only published posts. Anonymous + authenticated.
create policy "blog_posts_public_select_published"
  on public.blog_posts for select
  to anon, authenticated
  using (status = 'published');

-- Staff can see everything (drafts + archived included).
create policy "blog_posts_staff_select_all"
  on public.blog_posts for select
  to authenticated
  using (public.current_user_role() in ('photographer', 'super_admin'));

create policy "blog_posts_staff_insert"
  on public.blog_posts for insert
  to authenticated
  with check (public.current_user_role() in ('photographer', 'super_admin'));

create policy "blog_posts_staff_update"
  on public.blog_posts for update
  to authenticated
  using (public.current_user_role() in ('photographer', 'super_admin'))
  with check (public.current_user_role() in ('photographer', 'super_admin'));

create policy "blog_posts_staff_delete"
  on public.blog_posts for delete
  to authenticated
  using (public.current_user_role() in ('photographer', 'super_admin'));
