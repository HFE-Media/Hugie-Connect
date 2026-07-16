create table public.event_categories (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references public.organisations(id) on delete cascade,
  name text not null,
  slug text not null,
  description text,
  status text not null default 'active'
    check (status in ('active', 'inactive', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organisation_id, slug),
  unique (id, organisation_id)
);

create table public.events (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references public.organisations(id) on delete cascade,
  category_id uuid references public.event_categories(id),
  title text not null,
  slug text not null,
  summary text,
  description text,
  venue text,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  capacity integer,
  visibility text not null default 'public'
    check (visibility in ('public', 'members_only')),
  status text not null default 'draft'
    check (status in ('draft', 'published', 'cancelled', 'completed')),
  featured_image_url text,
  published_at timestamptz,
  created_by uuid references public.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organisation_id, slug),
  unique (id, organisation_id),
  constraint events_end_after_start check (ends_at > starts_at),
  constraint events_capacity_positive check (capacity is null or capacity > 0),
  constraint events_category_organisation_fk
    foreign key (category_id, organisation_id)
    references public.event_categories(id, organisation_id)
);

create index event_categories_organisation_status_idx
  on public.event_categories (organisation_id, status);
create index events_organisation_status_starts_idx
  on public.events (organisation_id, status, starts_at);
create index events_organisation_category_idx
  on public.events (organisation_id, category_id);
create index events_organisation_visibility_idx
  on public.events (organisation_id, visibility);

create trigger event_categories_set_updated_at
  before update on public.event_categories
  for each row execute function public.set_updated_at();

create trigger events_set_updated_at
  before update on public.events
  for each row execute function public.set_updated_at();

create or replace function public.current_user_can_manage_events(target_organisation_id uuid)
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
        'event_manager'
      ])
    )
$$;

create or replace function public.current_user_has_active_membership(target_organisation_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.members m
    where m.organisation_id = target_organisation_id
      and m.user_id = public.current_app_user_id()
      and m.status = 'active'
  )
$$;

alter table public.event_categories enable row level security;
alter table public.events enable row level security;

create policy "Public can read active event categories"
  on public.event_categories for select
  to anon, authenticated
  using (status = 'active');

create policy "Event admins can manage event categories"
  on public.event_categories for all
  to authenticated
  using (public.current_user_can_manage_events(organisation_id))
  with check (public.current_user_can_manage_events(organisation_id));

create policy "Public can read published public events"
  on public.events for select
  to anon, authenticated
  using (
    status = 'published'
    and visibility = 'public'
  );

create policy "Members can read published member events"
  on public.events for select
  to authenticated
  using (
    status = 'published'
    and visibility = 'members_only'
    and public.current_user_has_active_membership(organisation_id)
  );

create policy "Event admins can manage events"
  on public.events for all
  to authenticated
  using (public.current_user_can_manage_events(organisation_id))
  with check (public.current_user_can_manage_events(organisation_id));

insert into public.event_categories (organisation_id, name, slug, description)
select o.id, category.name, category.slug, category.description
from public.organisations o
cross join (
  values
    ('Sports', 'sports', 'Sporting fixtures and athletic events.'),
    ('Functions', 'functions', 'Community functions, dinners and fundraisers.'),
    ('Reunions', 'reunions', 'Alumni and supporter reunion events.')
) as category(name, slug, description)
where o.status = 'active'
on conflict (organisation_id, slug) do nothing;
