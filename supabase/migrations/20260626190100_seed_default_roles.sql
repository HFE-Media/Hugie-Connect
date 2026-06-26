insert into public.roles (name, description)
values
  ('super_admin', 'Platform-level administrator with access across organisations.'),
  ('school_admin', 'Organisation administrator responsible for daily operations.'),
  ('finance', 'Finance user responsible for payment and reconciliation workflows.'),
  ('ohb_admin', 'Membership administrator for one configured membership segment.'),
  ('hok_admin', 'Membership administrator for one configured membership segment.'),
  ('event_manager', 'User responsible for event setup and attendance operations.'),
  ('shop_manager', 'User responsible for merchandise and order operations.'),
  ('gate_staff', 'Gate operator with restricted scanner-focused access.'),
  ('member', 'Approved member with access to own member portal records.'),
  ('public_user', 'Authenticated non-member public user.'),
  ('guest_user', 'Unauthenticated public user represented for permission modelling.')
on conflict ((lower(name))) do update
set description = excluded.description;
