# 05 – Database Schema

**Project:** Hugie Connect
**Version:** 0.1
**Status:** Draft

---

# 1. Purpose

This document defines the planned database structure for Hugie Connect.

The database must be designed for:

* Membership management
* Digital membership cards
* Events
* Ticketing
* Gate scanning
* Merchandise
* Payments
* Reporting
* Future multi-school support

The schema should avoid school-specific naming so that the platform can later be reused for other schools.

---

# 2. Database Principles

## 2.1 Generic Naming

Avoid names like:

```sql
ohb_members
hok_events
hugie_tickets
```

Use generic names like:

```sql
members
membership_types
events
tickets
```

## 2.2 Multi-Organisation Ready

Even if Version 1 only supports Hoërskool Hugenote, the database should include `organisation_id` where appropriate.

This allows future support for multiple schools.

## 2.3 Auditability

Important actions should be stored in audit logs.

## 2.4 Security

Use Supabase Row Level Security.

Users must never access data outside their permissions.

---

# 3. Core Tables

## organisations

Stores each school or organisation.

```sql
organisations
- id uuid primary key
- name text not null
- slug text unique not null
- logo_url text
- primary_color text
- secondary_color text
- contact_email text
- contact_phone text
- status text default 'active'
- created_at timestamptz default now()
- updated_at timestamptz default now()
```

---

## users

Stores authenticated platform users.

This table should link to Supabase Auth users.

```sql
users
- id uuid primary key
- auth_user_id uuid unique not null
- organisation_id uuid references organisations(id)
- first_name text
- last_name text
- email text unique not null
- mobile text
- status text default 'active'
- created_at timestamptz default now()
- updated_at timestamptz default now()
```

---

## roles

Stores available system roles.

```sql
roles
- id uuid primary key
- name text unique not null
- description text
- created_at timestamptz default now()
```

Examples:

* super_admin
* school_admin
* finance
* ohb_admin
* hok_admin
* event_manager
* shop_manager
* gate_staff
* member
* public_user

---

## user_roles

Allows one user to have multiple roles.

```sql
user_roles
- id uuid primary key
- user_id uuid references users(id)
- role_id uuid references roles(id)
- organisation_id uuid references organisations(id)
- created_at timestamptz default now()
```

---

# 4. Membership Tables

## membership_types

Stores configurable membership types.

```sql
membership_types
- id uuid primary key
- organisation_id uuid references organisations(id)
- name text not null
- code text not null
- description text
- billing_cycle text
- price numeric(10,2)
- status text default 'active'
- created_at timestamptz default now()
- updated_at timestamptz default now()
```

Examples:

* OHB
* HOK

---

## members

Stores approved or pending members.

```sql
members
- id uuid primary key
- organisation_id uuid references organisations(id)
- user_id uuid references users(id)
- membership_type_id uuid references membership_types(id)
- member_number text unique not null
- status text not null
- joined_at timestamptz
- approved_at timestamptz
- expires_at timestamptz
- cancelled_at timestamptz
- created_at timestamptz default now()
- updated_at timestamptz default now()
```

Statuses:

* pending
* active
* suspended
* expired
* cancelled

---

## membership_applications

Stores submitted applications before approval.

```sql
membership_applications
- id uuid primary key
- organisation_id uuid references organisations(id)
- membership_type_id uuid references membership_types(id)
- first_name text not null
- last_name text not null
- email text not null
- mobile text
- application_data jsonb
- status text default 'pending'
- reviewed_by uuid references users(id)
- reviewed_at timestamptz
- rejection_reason text
- created_at timestamptz default now()
- updated_at timestamptz default now()
```

---

## membership_cards

Stores digital card details.

```sql
membership_cards
- id uuid primary key
- member_id uuid references members(id)
- qr_token text unique not null
- card_status text default 'active'
- issued_at timestamptz default now()
- regenerated_at timestamptz
- revoked_at timestamptz
- created_at timestamptz default now()
```

---

# 5. Benefits Tables

## benefits

Stores available benefits.

```sql
benefits
- id uuid primary key
- organisation_id uuid references organisations(id)
- name text not null
- description text
- benefit_type text
- status text default 'active'
- created_at timestamptz default now()
- updated_at timestamptz default now()
```

Benefit types:

* free_entry
* discount
* priority_access
* merchandise_access
* custom

---

## membership_type_benefits

Links benefits to membership types.

```sql
membership_type_benefits
- id uuid primary key
- membership_type_id uuid references membership_types(id)
- benefit_id uuid references benefits(id)
- rules jsonb
- status text default 'active'
- created_at timestamptz default now()
```

Example `rules`:

```json
{
  "discount_percentage": 20,
  "event_category": "mens_night",
  "limit_per_event": 1
}
```

---

# 6. Event Tables

## events

Stores events.

```sql
events
- id uuid primary key
- organisation_id uuid references organisations(id)
- name text not null
- slug text
- description text
- category text
- venue text
- starts_at timestamptz not null
- ends_at timestamptz
- capacity integer
- status text default 'draft'
- created_by uuid references users(id)
- created_at timestamptz default now()
- updated_at timestamptz default now()
```

Statuses:

* draft
* published
* cancelled
* completed

---

## ticket_types

Stores ticket types for each event.

```sql
ticket_types
- id uuid primary key
- event_id uuid references events(id)
- name text not null
- description text
- price numeric(10,2) not null
- quantity_available integer
- membership_type_id uuid references membership_types(id)
- visibility text default 'public'
- status text default 'active'
- created_at timestamptz default now()
- updated_at timestamptz default now()
```

Visibility:

* public
* members_only
* admin_only

---

## tickets

Stores issued tickets.

```sql
tickets
- id uuid primary key
- organisation_id uuid references organisations(id)
- event_id uuid references events(id)
- ticket_type_id uuid references ticket_types(id)
- user_id uuid references users(id)
- member_id uuid references members(id)
- purchaser_email text
- attendee_name text
- qr_token text unique not null
- price_paid numeric(10,2)
- payment_status text
- ticket_status text default 'valid'
- issued_at timestamptz default now()
- scanned_at timestamptz
- created_at timestamptz default now()
```

Ticket statuses:

* valid
* used
* cancelled
* refunded

Payment statuses:

* unpaid
* paid
* free
* refunded

---

# 7. Gate & Scan Tables

## scan_logs

Stores ticket and membership scans.

```sql
scan_logs
- id uuid primary key
- organisation_id uuid references organisations(id)
- event_id uuid references events(id)
- scanned_by uuid references users(id)
- scan_type text not null
- qr_token text not null
- result text not null
- message text
- ticket_id uuid references tickets(id)
- member_id uuid references members(id)
- scanned_at timestamptz default now()
```

Scan types:

* ticket
* membership

Results:

* admitted
* denied
* already_used
* expired
* invalid
* manual_override

---

## gate_sales

Stores walk-in sales.

```sql
gate_sales
- id uuid primary key
- organisation_id uuid references organisations(id)
- event_id uuid references events(id)
- ticket_type_id uuid references ticket_types(id)
- sold_by uuid references users(id)
- payment_method text
- amount numeric(10,2)
- quantity integer default 1
- created_ticket_id uuid references tickets(id)
- created_at timestamptz default now()
```

Payment methods:

* cash
* card
* free
* complimentary

---

# 8. Merchandise Tables

## products

Stores merchandise products.

```sql
products
- id uuid primary key
- organisation_id uuid references organisations(id)
- name text not null
- description text
- category text
- price numeric(10,2) not null
- image_url text
- visibility text default 'public'
- status text default 'active'
- created_at timestamptz default now()
- updated_at timestamptz default now()
```

Visibility:

* public
* members_only
* ohb_only
* hok_only

---

## product_membership_access

Controls which membership types can buy products.

```sql
product_membership_access
- id uuid primary key
- product_id uuid references products(id)
- membership_type_id uuid references membership_types(id)
- created_at timestamptz default now()
```

---

## orders

Stores merchandise orders.

```sql
orders
- id uuid primary key
- organisation_id uuid references organisations(id)
- user_id uuid references users(id)
- member_id uuid references members(id)
- order_number text unique not null
- status text default 'pending'
- payment_status text default 'unpaid'
- total_amount numeric(10,2)
- collection_status text default 'not_ready'
- created_at timestamptz default now()
- updated_at timestamptz default now()
```

---

## order_items

Stores items inside orders.

```sql
order_items
- id uuid primary key
- order_id uuid references orders(id)
- product_id uuid references products(id)
- quantity integer not null
- unit_price numeric(10,2)
- total_price numeric(10,2)
- created_at timestamptz default now()
```

---

# 9. Payment Tables

## payments

Stores payments from tickets, memberships and merchandise.

```sql
payments
- id uuid primary key
- organisation_id uuid references organisations(id)
- user_id uuid references users(id)
- member_id uuid references members(id)
- payment_reference text unique
- payment_provider text
- payment_type text not null
- related_record_type text
- related_record_id uuid
- amount numeric(10,2) not null
- status text default 'pending'
- paid_at timestamptz
- created_at timestamptz default now()
- updated_at timestamptz default now()
```

Payment types:

* membership
* ticket
* merchandise
* donation

Statuses:

* pending
* paid
* failed
* refunded
* cancelled

---

# 10. Notifications Tables

## notifications

Stores system notifications.

```sql
notifications
- id uuid primary key
- organisation_id uuid references organisations(id)
- user_id uuid references users(id)
- notification_type text
- channel text
- subject text
- message text
- status text default 'pending'
- sent_at timestamptz
- created_at timestamptz default now()
```

Channels:

* email
* whatsapp
* sms
* in_app

---

# 11. Audit Tables

## audit_logs

Stores important administrative actions.

```sql
audit_logs
- id uuid primary key
- organisation_id uuid references organisations(id)
- user_id uuid references users(id)
- action text not null
- entity_type text
- entity_id uuid
- old_values jsonb
- new_values jsonb
- ip_address text
- user_agent text
- created_at timestamptz default now()
```

---

# 12. Recommended Indexes

Indexes should be added for:

```sql
users.email
members.member_number
members.status
members.membership_type_id
membership_cards.qr_token
tickets.qr_token
tickets.event_id
tickets.ticket_status
scan_logs.event_id
scan_logs.qr_token
payments.payment_reference
orders.order_number
```

---

# 13. Row Level Security Notes

RLS policies must ensure:

* Members only see their own records.
* Gate Staff only access assigned event scanning functions.
* School Admins only access their organisation.
* Super Admins may access all organisations.
* Public users cannot view private member data.
* Finance users access payment reports only for their organisation.

---

# 14. Future Database Considerations

Future tables may include:

* partner_businesses
* partner_offers
* loyalty_points
* wallet_passes
* donations
* sponsorships
* family_memberships
* event_seating
* waiting_lists
* volunteer_shifts
* organisation_settings

These are intentionally excluded from Version 1 unless required.

---

# 15. Acceptance Criteria

The database design is acceptable when:

* Every major workflow has supporting tables.
* No table is hardcoded to Hugenote only.
* Membership QR and ticket QR are stored separately.
* Tickets and gate scans are traceable.
* Payments can link to different payment types.
* Merchandise can be restricted by membership type.
* Reporting can be generated from stored data.
* Future multi-school support is possible without complete redesign.
