with seeded_organisation as (
  insert into public.organisations (
    name,
    slug,
    status
  )
  values (
    'Hoërskool Hugenote',
    'hoerskool-hugenote',
    'active'
  )
  on conflict ((lower(slug))) do update
  set
    name = excluded.name,
    status = excluded.status,
    updated_at = now()
  returning id
),
target_organisation as (
  select id from seeded_organisation
  union all
  select id
  from public.organisations
  where lower(slug) = lower('hoerskool-hugenote')
  limit 1
)
insert into public.membership_types (
  organisation_id,
  name,
  code,
  description,
  billing_cycle,
  price,
  status
)
select
  target_organisation.id,
  seed.name,
  seed.code,
  seed.description,
  seed.billing_cycle,
  seed.price,
  seed.status
from target_organisation
cross join (
  values
    (
      'Oud Hugie Bond',
      'OHB',
      'Alumni membership for former learners.',
      'monthly',
      50.00::numeric(10, 2),
      'active'
    ),
    (
      'Hugie Ondersteuners Klub',
      'HOK',
      'Supporter membership for parents, families and community supporters.',
      'monthly',
      50.00::numeric(10, 2),
      'active'
    )
) as seed(name, code, description, billing_cycle, price, status)
on conflict (organisation_id, lower(code)) do update
set
  name = excluded.name,
  description = excluded.description,
  billing_cycle = excluded.billing_cycle,
  price = excluded.price,
  status = excluded.status,
  updated_at = now();
