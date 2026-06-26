create unique index if not exists user_roles_global_role_key
  on public.user_roles (user_id, role_id)
  where organisation_id is null;

create unique index if not exists users_id_organisation_id_key
  on public.users (id, organisation_id);

create unique index if not exists membership_types_id_organisation_id_key
  on public.membership_types (id, organisation_id);

create unique index if not exists membership_applications_id_organisation_id_key
  on public.membership_applications (id, organisation_id);

create unique index if not exists members_id_organisation_id_key
  on public.members (id, organisation_id);

alter table public.membership_applications
  add constraint membership_applications_type_same_organisation_fk
  foreign key (membership_type_id, organisation_id)
  references public.membership_types (id, organisation_id)
  on delete restrict;

alter table public.members
  add constraint members_type_same_organisation_fk
  foreign key (membership_type_id, organisation_id)
  references public.membership_types (id, organisation_id)
  on delete restrict;

alter table public.members
  add constraint members_application_same_organisation_fk
  foreign key (membership_application_id, organisation_id)
  references public.membership_applications (id, organisation_id)
  on delete no action;

alter table public.membership_periods
  add constraint membership_periods_member_same_organisation_fk
  foreign key (member_id, organisation_id)
  references public.members (id, organisation_id)
  on delete cascade;

alter table public.membership_cards
  add constraint membership_cards_member_same_organisation_fk
  foreign key (member_id, organisation_id)
  references public.members (id, organisation_id)
  on delete cascade;

create unique index if not exists membership_cards_one_active_per_member_key
  on public.membership_cards (member_id)
  where card_status = 'active';

revoke all on function public.current_app_user_id() from public, anon;
revoke all on function public.current_app_user_organisation_id() from public, anon;
revoke all on function public.current_user_has_any_role(text[]) from public, anon;
revoke all on function public.current_user_can_manage_memberships(uuid) from public, anon;

grant execute on function public.current_app_user_id() to authenticated, service_role;
grant execute on function public.current_app_user_organisation_id() to authenticated, service_role;
grant execute on function public.current_user_has_any_role(text[]) to authenticated, service_role;
grant execute on function public.current_user_can_manage_memberships(uuid) to authenticated, service_role;
