-- Fixed-window rate limiter backed by Postgres.
-- Cheap: one upsert per check, indexed lookup, periodic prune.

create table public.rate_limits (
  key text not null,
  window_start timestamptz not null,
  count int not null default 0,
  primary key (key, window_start)
);

create index rate_limits_window_idx on public.rate_limits (window_start);

alter table public.rate_limits enable row level security;
-- No policies: only service role / SECURITY DEFINER RPC may touch this table.

-- Atomic check + increment in a single round-trip. Returns whether the call is
-- allowed and, if not, how many seconds until the current window closes.
create or replace function public.rate_limit_check(
  p_key text,
  p_window_seconds int,
  p_max int
) returns table(allowed boolean, retry_after_seconds int)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_window_start timestamptz;
  v_count int;
begin
  -- Snap "now" down to the start of the current fixed window.
  v_window_start := to_timestamp(
    floor(extract(epoch from now()) / p_window_seconds) * p_window_seconds
  );

  insert into public.rate_limits (key, window_start, count)
  values (p_key, v_window_start, 1)
  on conflict (key, window_start)
    do update set count = public.rate_limits.count + 1
  returning count into v_count;

  if v_count <= p_max then
    return query select true, 0;
  else
    return query select
      false,
      greatest(
        1,
        ceil(extract(epoch from (v_window_start + make_interval(secs => p_window_seconds) - now())))::int
      );
  end if;
end;
$$;

-- Garbage-collect old window rows. Call from the existing release-holds cron.
create or replace function public.rate_limit_prune(p_older_than_seconds int default 86400)
returns int
language plpgsql
security definer
set search_path = public
as $$
declare
  v_deleted int;
begin
  delete from public.rate_limits
  where window_start < now() - make_interval(secs => p_older_than_seconds);
  get diagnostics v_deleted = row_count;
  return v_deleted;
end;
$$;

revoke all on function public.rate_limit_check(text, int, int) from public, anon, authenticated;
revoke all on function public.rate_limit_prune(int) from public, anon, authenticated;
