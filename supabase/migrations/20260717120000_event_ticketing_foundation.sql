create table public.event_ticket_types (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references public.organisations(id) on delete cascade,
  event_id uuid not null,
  name text not null,
  description text,
  price numeric(10, 2) not null default 0,
  currency text not null default 'ZAR',
  quantity_available integer,
  sales_start_at timestamptz,
  sales_end_at timestamptz,
  active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, organisation_id),
  unique (id, event_id, organisation_id),
  constraint event_ticket_types_event_organisation_fk
    foreign key (event_id, organisation_id)
    references public.events(id, organisation_id)
    on delete cascade,
  constraint event_ticket_types_name_required check (length(trim(name)) > 0),
  constraint event_ticket_types_price_non_negative check (price >= 0),
  constraint event_ticket_types_quantity_positive check (
    quantity_available is null or quantity_available > 0
  ),
  constraint event_ticket_types_currency_format check (
    currency = upper(currency)
    and currency ~ '^[A-Z]{3}$'
  ),
  constraint event_ticket_types_sales_window check (
    sales_start_at is null
    or sales_end_at is null
    or sales_end_at > sales_start_at
  )
);

create table public.event_tickets (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references public.organisations(id) on delete cascade,
  event_id uuid not null,
  ticket_type_id uuid not null,
  purchaser_user_id uuid references public.users(id) on delete set null,
  holder_name text not null,
  holder_email text,
  ticket_number text not null,
  qr_token text not null,
  status text not null default 'issued'
    check (status in ('issued', 'cancelled', 'used', 'refunded')),
  issued_at timestamptz not null default now(),
  cancelled_at timestamptz,
  checked_in_at timestamptz,
  checked_in_by uuid references public.users(id) on delete set null,
  created_by uuid references public.users(id) on delete set null,
  internal_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, organisation_id),
  unique (organisation_id, ticket_number),
  unique (qr_token),
  constraint event_tickets_event_organisation_fk
    foreign key (event_id, organisation_id)
    references public.events(id, organisation_id)
    on delete cascade,
  constraint event_tickets_ticket_type_event_organisation_fk
    foreign key (ticket_type_id, event_id, organisation_id)
    references public.event_ticket_types(id, event_id, organisation_id),
  constraint event_tickets_holder_name_required check (length(trim(holder_name)) > 0),
  constraint event_tickets_holder_email_format check (
    holder_email is null
    or holder_email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'
  )
);

create index event_ticket_types_event_active_idx
  on public.event_ticket_types (organisation_id, event_id, active, sort_order);
create index event_ticket_types_sales_window_idx
  on public.event_ticket_types (sales_start_at, sales_end_at);
create index event_tickets_event_status_idx
  on public.event_tickets (organisation_id, event_id, status);
create index event_tickets_ticket_type_status_idx
  on public.event_tickets (organisation_id, ticket_type_id, status);
create index event_tickets_purchaser_user_idx
  on public.event_tickets (organisation_id, purchaser_user_id);
create index event_tickets_holder_email_idx
  on public.event_tickets (organisation_id, lower(holder_email));
create index event_tickets_qr_token_idx
  on public.event_tickets (qr_token);

create trigger event_ticket_types_set_updated_at
  before update on public.event_ticket_types
  for each row execute function public.set_updated_at();

create trigger event_tickets_set_updated_at
  before update on public.event_tickets
  for each row execute function public.set_updated_at();

create or replace function public.current_app_user_email()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select email
  from public.users
  where auth_user_id = auth.uid()
  limit 1
$$;

revoke all on function public.current_app_user_email() from public, anon;
grant execute on function public.current_app_user_email() to authenticated, service_role;

alter table public.event_ticket_types enable row level security;
alter table public.event_tickets enable row level security;

create policy "Public can read published public event ticket types"
  on public.event_ticket_types for select
  to anon, authenticated
  using (
    active = true
    and exists (
      select 1
      from public.events e
      where e.id = event_ticket_types.event_id
        and e.organisation_id = event_ticket_types.organisation_id
        and e.status = 'published'
        and e.visibility = 'public'
    )
  );

create policy "Members can read published member event ticket types"
  on public.event_ticket_types for select
  to authenticated
  using (
    active = true
    and exists (
      select 1
      from public.events e
      where e.id = event_ticket_types.event_id
        and e.organisation_id = event_ticket_types.organisation_id
        and e.status = 'published'
        and e.visibility = 'members_only'
        and public.current_user_has_active_membership(e.organisation_id)
    )
  );

create policy "Event admins can manage ticket types"
  on public.event_ticket_types for all
  to authenticated
  using (public.current_user_can_manage_events(organisation_id))
  with check (public.current_user_can_manage_events(organisation_id));

create policy "Users can read own event tickets"
  on public.event_tickets for select
  to authenticated
  using (
    organisation_id = public.current_app_user_organisation_id()
    and (
      purchaser_user_id = public.current_app_user_id()
      or (
        holder_email is not null
        and lower(holder_email) = lower(public.current_app_user_email())
      )
    )
  );

create policy "Event admins can manage event tickets"
  on public.event_tickets for all
  to authenticated
  using (public.current_user_can_manage_events(organisation_id))
  with check (public.current_user_can_manage_events(organisation_id));
