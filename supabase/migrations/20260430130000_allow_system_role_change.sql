-- The role-change guard now allows updates with no auth context (system/admin
-- tools). Authenticated requests still must be super_admin to change role.
create or replace function public.prevent_self_role_change()
returns trigger
language plpgsql
as $$
begin
  if new.role is distinct from old.role
     and auth.uid() is not null
     and coalesce(public.current_user_role(), 'customer') <> 'super_admin' then
    raise exception 'Only super_admin can change role';
  end if;
  return new;
end;
$$;
