create extension if not exists pgcrypto with schema extensions;

create or replace function public.approve_membership_application(
  p_application_id uuid,
  p_organisation_id uuid,
  p_reviewed_by uuid,
  p_member_number text,
  p_period_starts_at timestamptz,
  p_period_ends_at timestamptz,
  p_qr_token text default null
)
returns table (
  application_id uuid,
  member_id uuid,
  membership_period_id uuid,
  membership_card_id uuid
)
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_application public.membership_applications%rowtype;
  v_member_id uuid;
  v_membership_period_id uuid;
  v_membership_card_id uuid;
  v_qr_token text;
begin
  if p_period_ends_at <= p_period_starts_at then
    raise exception 'Membership period end must be after start';
  end if;

  if p_member_number is null or length(trim(p_member_number)) = 0 then
    raise exception 'Member number is required';
  end if;

  if p_reviewed_by is null then
    raise exception 'Reviewer is required';
  end if;

  if auth.role() <> 'service_role'
    and not public.current_user_can_manage_memberships(p_organisation_id) then
    raise exception 'Not authorised to approve membership applications'
      using errcode = '42501';
  end if;

  if not exists (
    select 1
    from public.users u
    where u.id = p_reviewed_by
      and (
        u.organisation_id = p_organisation_id
        or public.current_user_has_any_role(array['super_admin'])
      )
  ) then
    raise exception 'Reviewer does not belong to the target organisation'
      using errcode = '42501';
  end if;

  select *
  into v_application
  from public.membership_applications
  where id = p_application_id
    and organisation_id = p_organisation_id
  for update;

  if not found then
    raise exception 'Membership application not found'
      using errcode = 'P0002';
  end if;

  if v_application.status <> 'pending' then
    raise exception 'Only pending membership applications can be approved';
  end if;

  v_qr_token := coalesce(nullif(trim(p_qr_token), ''), encode(gen_random_bytes(32), 'hex'));

  update public.membership_applications
  set status = 'approved',
      reviewed_by = p_reviewed_by,
      reviewed_at = now(),
      rejection_reason = null
  where id = v_application.id;

  insert into public.members (
    organisation_id,
    user_id,
    membership_type_id,
    membership_application_id,
    member_number,
    status,
    joined_at,
    approved_at,
    expires_at
  )
  values (
    p_organisation_id,
    null,
    v_application.membership_type_id,
    v_application.id,
    trim(p_member_number),
    'active',
    p_period_starts_at,
    now(),
    p_period_ends_at
  )
  returning id into v_member_id;

  insert into public.membership_periods (
    organisation_id,
    member_id,
    starts_at,
    ends_at,
    status,
    source
  )
  values (
    p_organisation_id,
    v_member_id,
    p_period_starts_at,
    p_period_ends_at,
    'active',
    'application_approval'
  )
  returning id into v_membership_period_id;

  insert into public.membership_cards (
    organisation_id,
    member_id,
    qr_token,
    card_status
  )
  values (
    p_organisation_id,
    v_member_id,
    v_qr_token,
    'active'
  )
  returning id into v_membership_card_id;

  insert into public.audit_logs (
    organisation_id,
    user_id,
    action,
    entity_type,
    entity_id,
    old_values,
    new_values
  )
  values (
    p_organisation_id,
    p_reviewed_by,
    'membership_application_approved',
    'membership_application',
    v_application.id,
    jsonb_build_object('status', v_application.status),
    jsonb_build_object(
      'status', 'approved',
      'member_id', v_member_id,
      'membership_period_id', v_membership_period_id,
      'membership_card_id', v_membership_card_id
    )
  );

  return query
  select
    v_application.id,
    v_member_id,
    v_membership_period_id,
    v_membership_card_id;
end;
$$;

revoke all on function public.approve_membership_application(
  uuid,
  uuid,
  uuid,
  text,
  timestamptz,
  timestamptz,
  text
) from public, anon;

grant execute on function public.approve_membership_application(
  uuid,
  uuid,
  uuid,
  text,
  timestamptz,
  timestamptz,
  text
) to authenticated, service_role;
