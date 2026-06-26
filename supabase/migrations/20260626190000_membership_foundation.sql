create extension if not exists pgcrypto;

create table public.organisations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null,
  logo_url text,
  primary_color text,
  secondary_color text,
  contact_email text,
  contact_phone text,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint organisations_status_check check (status in ('active', 'inactive'))
);

create unique index organisations_slug_key on public.organisations (lower(slug));

create table public.users (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid not null unique references auth.users(id) on delete cascade,
  organisation_id uuid references public.organisations(id) on delete set null,
  first_name text,
  last_name text,
  email text not null,
  mobile text,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint users_status_check check (status in ('active', 'suspended', 'inactive'))
);

create unique index users_organisation_email_key
  on public.users (organisation_id, lower(email))
  where organisation_id is not null;

create index users_auth_user_id_idx on public.users (auth_user_id);
create index users_organisation_id_idx on public.users (organisation_id);

create table public.roles (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  created_at timestamptz not null default now()
);

create unique index roles_name_key on public.roles (lower(name));

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  role_id uuid not null references public.roles(id) on delete cascade,
  organisation_id uuid references public.organisations(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, role_id, organisation_id)
);

create index user_roles_user_id_idx on public.user_roles (user_id);
create index user_roles_role_id_idx on public.user_roles (role_id);
create index user_roles_organisation_id_idx on public.user_roles (organisation_id);

create table public.membership_types (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references public.organisations(id) on delete cascade,
  name text not null,
  code text not null,
  description text,
  billing_cycle text,
  price numeric(10, 2),
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint membership_types_billing_cycle_check check (
    billing_cycle is null or billing_cycle in ('once_off', 'monthly', 'annual')
  ),
  constraint membership_types_price_check check (price is null or price >= 0),
  constraint membership_types_status_check check (status in ('active', 'inactive', 'archived'))
);

create unique index membership_types_organisation_code_key
  on public.membership_types (organisation_id, lower(code));

create unique index membership_types_organisation_name_key
  on public.membership_types (organisation_id, lower(name));

create index membership_types_organisation_id_idx on public.membership_types (organisation_id);
create index membership_types_status_idx on public.membership_types (status);

create table public.membership_applications (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references public.organisations(id) on delete cascade,
  membership_type_id uuid not null references public.membership_types(id) on delete restrict,
  first_name text not null,
  last_name text not null,
  email text not null,
  mobile text,
  application_data jsonb not null default '{}'::jsonb,
  status text not null default 'pending',
  reviewed_by uuid references public.users(id) on delete set null,
  reviewed_at timestamptz,
  rejection_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint membership_applications_status_check check (
    status in ('pending', 'approved', 'rejected', 'cancelled')
  )
);

create index membership_applications_organisation_id_idx on public.membership_applications (organisation_id);
create index membership_applications_membership_type_id_idx on public.membership_applications (membership_type_id);
create index membership_applications_status_idx on public.membership_applications (status);
create index membership_applications_email_lookup_idx
  on public.membership_applications (organisation_id, lower(email));

create table public.members (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references public.organisations(id) on delete cascade,
  user_id uuid references public.users(id) on delete set null,
  membership_type_id uuid not null references public.membership_types(id) on delete restrict,
  membership_application_id uuid references public.membership_applications(id) on delete set null,
  member_number text not null,
  status text not null default 'pending',
  joined_at timestamptz,
  approved_at timestamptz,
  expires_at timestamptz,
  cancelled_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint members_status_check check (
    status in ('pending', 'active', 'suspended', 'expired', 'cancelled')
  )
);

create unique index members_organisation_member_number_key
  on public.members (organisation_id, lower(member_number));

create index members_organisation_id_idx on public.members (organisation_id);
create index members_user_id_idx on public.members (user_id);
create index members_membership_type_id_idx on public.members (membership_type_id);
create index members_status_idx on public.members (status);

create table public.membership_periods (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references public.organisations(id) on delete cascade,
  member_id uuid not null references public.members(id) on delete cascade,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  status text not null default 'pending',
  source text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint membership_periods_status_check check (
    status in ('pending', 'active', 'expired', 'cancelled')
  ),
  constraint membership_periods_date_check check (ends_at > starts_at)
);

create index membership_periods_organisation_id_idx on public.membership_periods (organisation_id);
create index membership_periods_member_id_idx on public.membership_periods (member_id);
create index membership_periods_status_idx on public.membership_periods (status);
create index membership_periods_dates_idx on public.membership_periods (starts_at, ends_at);

create table public.membership_cards (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references public.organisations(id) on delete cascade,
  member_id uuid not null references public.members(id) on delete cascade,
  qr_token text not null unique,
  card_status text not null default 'active',
  issued_at timestamptz not null default now(),
  regenerated_at timestamptz,
  revoked_at timestamptz,
  created_at timestamptz not null default now(),
  constraint membership_cards_status_check check (card_status in ('active', 'revoked', 'expired'))
);

create index membership_cards_organisation_id_idx on public.membership_cards (organisation_id);
create index membership_cards_member_id_idx on public.membership_cards (member_id);
create index membership_cards_card_status_idx on public.membership_cards (card_status);

create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid references public.organisations(id) on delete set null,
  user_id uuid references public.users(id) on delete set null,
  action text not null,
  entity_type text,
  entity_id uuid,
  old_values jsonb,
  new_values jsonb,
  ip_address text,
  user_agent text,
  created_at timestamptz not null default now()
);

create index audit_logs_organisation_id_idx on public.audit_logs (organisation_id);
create index audit_logs_user_id_idx on public.audit_logs (user_id);
create index audit_logs_entity_idx on public.audit_logs (entity_type, entity_id);
create index audit_logs_action_idx on public.audit_logs (action);
create index audit_logs_created_at_idx on public.audit_logs (created_at desc);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger organisations_set_updated_at
  before update on public.organisations
  for each row execute function public.set_updated_at();

create trigger users_set_updated_at
  before update on public.users
  for each row execute function public.set_updated_at();

create trigger membership_types_set_updated_at
  before update on public.membership_types
  for each row execute function public.set_updated_at();

create trigger membership_applications_set_updated_at
  before update on public.membership_applications
  for each row execute function public.set_updated_at();

create trigger members_set_updated_at
  before update on public.members
  for each row execute function public.set_updated_at();

create trigger membership_periods_set_updated_at
  before update on public.membership_periods
  for each row execute function public.set_updated_at();

create or replace function public.current_app_user_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select id
  from public.users
  where auth_user_id = auth.uid()
  limit 1
$$;

create or replace function public.current_app_user_organisation_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select organisation_id
  from public.users
  where auth_user_id = auth.uid()
  limit 1
$$;

create or replace function public.current_user_has_any_role(role_names text[])
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.users u
    join public.user_roles ur on ur.user_id = u.id
    join public.roles r on r.id = ur.role_id
    where u.auth_user_id = auth.uid()
      and lower(r.name) = any (
        select lower(role_name)
        from unnest(role_names) as role_name
      )
  )
$$;

create or replace function public.current_user_can_manage_memberships(target_organisation_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.current_user_has_any_role(array['super_admin'])
    or (
      public.current_app_user_organisation_id() = target_organisation_id
      and public.current_user_has_any_role(array[
        'school_admin',
        'ohb_admin',
        'hok_admin'
      ])
    )
$$;

alter table public.organisations enable row level security;
alter table public.users enable row level security;
alter table public.roles enable row level security;
alter table public.user_roles enable row level security;
alter table public.membership_types enable row level security;
alter table public.membership_applications enable row level security;
alter table public.members enable row level security;
alter table public.membership_periods enable row level security;
alter table public.membership_cards enable row level security;
alter table public.audit_logs enable row level security;

create policy "Users can read their organisation"
  on public.organisations for select
  to authenticated
  using (
    id = public.current_app_user_organisation_id()
    or public.current_user_has_any_role(array['super_admin'])
  );

create policy "Super admins can manage organisations"
  on public.organisations for all
  to authenticated
  using (public.current_user_has_any_role(array['super_admin']))
  with check (public.current_user_has_any_role(array['super_admin']));

create policy "Users can read own user record"
  on public.users for select
  to authenticated
  using (
    auth_user_id = auth.uid()
    or public.current_user_can_manage_memberships(organisation_id)
  );

create policy "Super admins can manage users"
  on public.users for all
  to authenticated
  using (public.current_user_has_any_role(array['super_admin']))
  with check (public.current_user_has_any_role(array['super_admin']));

create policy "Authenticated users can read roles"
  on public.roles for select
  to authenticated
  using (true);

create policy "Super admins can manage roles"
  on public.roles for all
  to authenticated
  using (public.current_user_has_any_role(array['super_admin']))
  with check (public.current_user_has_any_role(array['super_admin']));

create policy "Users can read visible role assignments"
  on public.user_roles for select
  to authenticated
  using (
    user_id = public.current_app_user_id()
    or public.current_user_can_manage_memberships(organisation_id)
  );

create policy "Super admins can manage role assignments"
  on public.user_roles for all
  to authenticated
  using (public.current_user_has_any_role(array['super_admin']))
  with check (public.current_user_has_any_role(array['super_admin']));

create policy "Organisation users can read membership types"
  on public.membership_types for select
  to authenticated
  using (
    organisation_id = public.current_app_user_organisation_id()
    or public.current_user_has_any_role(array['super_admin'])
  );

create policy "Membership admins can manage membership types"
  on public.membership_types for all
  to authenticated
  using (public.current_user_can_manage_memberships(organisation_id))
  with check (public.current_user_can_manage_memberships(organisation_id));

create policy "Users can read own membership applications"
  on public.membership_applications for select
  to authenticated
  using (
    lower(email) = lower((auth.jwt() ->> 'email'))
    or public.current_user_can_manage_memberships(organisation_id)
  );

create policy "Membership admins can manage membership applications"
  on public.membership_applications for all
  to authenticated
  using (public.current_user_can_manage_memberships(organisation_id))
  with check (public.current_user_can_manage_memberships(organisation_id));

create policy "Users can read own members"
  on public.members for select
  to authenticated
  using (
    user_id = public.current_app_user_id()
    or public.current_user_can_manage_memberships(organisation_id)
  );

create policy "Membership admins can manage members"
  on public.members for all
  to authenticated
  using (public.current_user_can_manage_memberships(organisation_id))
  with check (public.current_user_can_manage_memberships(organisation_id));

create policy "Users can read own membership periods"
  on public.membership_periods for select
  to authenticated
  using (
    exists (
      select 1
      from public.members m
      where m.id = membership_periods.member_id
        and m.user_id = public.current_app_user_id()
    )
    or public.current_user_can_manage_memberships(organisation_id)
  );

create policy "Membership admins can manage membership periods"
  on public.membership_periods for all
  to authenticated
  using (public.current_user_can_manage_memberships(organisation_id))
  with check (public.current_user_can_manage_memberships(organisation_id));

create policy "Users can read own membership cards"
  on public.membership_cards for select
  to authenticated
  using (
    exists (
      select 1
      from public.members m
      where m.id = membership_cards.member_id
        and m.user_id = public.current_app_user_id()
    )
    or public.current_user_can_manage_memberships(organisation_id)
  );

create policy "Membership admins can manage membership cards"
  on public.membership_cards for all
  to authenticated
  using (public.current_user_can_manage_memberships(organisation_id))
  with check (public.current_user_can_manage_memberships(organisation_id));

create policy "Organisation admins can read audit logs"
  on public.audit_logs for select
  to authenticated
  using (
    public.current_user_has_any_role(array['super_admin'])
    or public.current_user_can_manage_memberships(organisation_id)
  );

create policy "Authenticated users can create audit logs for themselves"
  on public.audit_logs for insert
  to authenticated
  with check (
    user_id = public.current_app_user_id()
    and (
      organisation_id = public.current_app_user_organisation_id()
      or public.current_user_has_any_role(array['super_admin'])
    )
  );
