# 03 – User Roles & Permissions

**Project:** Hugie Connect
**Version:** 0.1
**Status:** Draft

---

# 1. Purpose

This document defines every user type that may interact with the platform.

It explains:

* Who the users are
* What they can access
* What they can create
* What they can edit
* What they must never access

The system must use role-based access control.

Users should only see the features required for their role.

---

# 2. Permission Philosophy

The platform must follow the principle of least privilege.

This means:

A user should only have access to the minimum features required to do their job.

Example:

Gate Staff should be able to scan tickets and sell gate tickets.

Gate Staff should not be able to:

* Edit members
* View financial reports
* Delete events
* Change ticket prices
* Export member data

---

# 3. Role List

The platform must support the following roles:

1. Super Admin
2. School Admin
3. Finance User
4. OHB Admin
5. HOK Admin
6. Event Manager
7. Shop Manager
8. Gate Staff
9. Member
10. Public User
11. Guest User

Future roles may be added later.

---

# 4. Super Admin

## Description

The Super Admin is the highest-level system user.

This role is intended for the platform owner, developer, or technical support team.

## Responsibilities

* Manage the entire platform.
* Manage system settings.
* Manage organisation settings.
* Manage all users and roles.
* Access all modules.
* Troubleshoot technical issues.
* Support school administrators.

## Permissions

Can:

* View all data.
* Create users.
* Edit users.
* Suspend users.
* Assign roles.
* Manage system settings.
* Manage integrations.
* View logs.
* View reports.
* Override system rules where required.
* Configure branding.
* Manage payment settings.
* Manage security settings.

Should not normally:

* Perform daily school administration unless required.
* Process normal school operations unless providing support.

---

# 5. School Admin

## Description

The School Admin is the main administrative user for Hoërskool Hugenote.

This role manages the operational side of the platform.

## Responsibilities

* Manage members.
* Manage events.
* Manage benefits.
* Manage merchandise.
* Manage tickets.
* View reports.
* Manage staff users.

## Permissions

Can:

* View all members.
* Add members.
* Edit members.
* Approve memberships.
* Suspend memberships.
* Create events.
* Edit events.
* Create ticket types.
* Edit ticket prices.
* Manage benefits.
* Manage products.
* View reports.
* Export reports.
* Manage Gate Staff users.
* Manage Shop Staff users.
* View gate logs.
* View merchandise orders.

Cannot:

* Access low-level technical settings unless granted.
* Modify platform-wide code or system architecture.
* Access other schools in future multi-school versions.

---

# 6. Finance User

## Description

The Finance User manages financial information, payments, exports, refunds and reporting.

## Responsibilities

* Confirm payments.
* Review revenue.
* Export reports.
* Assist with reconciliations.
* Manage refunds if allowed.

## Permissions

Can:

* View membership payments.
* View ticket payments.
* View merchandise payments.
* Export financial reports.
* Mark manual payments as paid if authorised.
* View outstanding payments.
* View refunded transactions.

May be allowed to:

* Process refunds.
* Update payment status.
* Export bank reconciliation reports.

Cannot:

* Delete members.
* Delete events.
* Change user roles.
* Change system settings.
* Modify member benefits unless also assigned admin access.

---

# 7. OHB Admin

## Description

The OHB Admin manages the Oud Hugie Bond side of the platform.

## Responsibilities

* Manage OHB members.
* Manage OHB events.
* Manage OHB benefits.
* Communicate with OHB members.
* View OHB-related reports.

## Permissions

Can:

* View OHB members.
* Approve OHB members.
* Edit OHB member details.
* View OHB membership status.
* Create OHB-specific events if allowed.
* Manage OHB-specific benefits if allowed.
* View OHB reports.
* View OHB event attendance.

Cannot:

* Manage HOK members unless also assigned HOK Admin.
* Access full financial reports unless granted Finance access.
* Modify global system settings.
* Delete platform records unless specifically permitted.

---

# 8. HOK Admin

## Description

The HOK Admin manages the Hugie Ondersteuners Klub side of the platform.

## Responsibilities

* Manage HOK members.
* Manage HOK benefits.
* Manage HOK-related events.
* View supporter reports.

## Permissions

Can:

* View HOK members.
* Approve HOK members.
* Edit HOK member details.
* View HOK membership status.
* Create HOK-specific events if allowed.
* Manage HOK-specific benefits if allowed.
* View HOK reports.
* View HOK benefit usage.

Cannot:

* Manage OHB members unless also assigned OHB Admin.
* Access full financial reports unless granted Finance access.
* Modify global platform settings.
* Delete platform records unless specifically permitted.

---

# 9. Event Manager

## Description

The Event Manager creates and manages events.

Examples:

* Rugby matches
* Hockey matches
* Golf days
* Men's Night
* Reunions
* Fundraisers

## Responsibilities

* Create events.
* Set event details.
* Configure ticket types.
* Configure pricing.
* Configure event capacity.
* View event attendance.
* Manage gate setup.

## Permissions

Can:

* Create events.
* Edit events.
* Create ticket types.
* Edit ticket descriptions.
* Configure event capacity.
* View event ticket sales.
* View event attendance.
* Assign Gate Staff to events.

May be allowed to:

* Edit ticket prices.
* Issue complimentary tickets.
* Close ticket sales.
* Reopen ticket sales.

Cannot:

* Manage member profiles unless granted.
* View unrelated financial data.
* Change membership statuses.
* Modify system settings.

---

# 10. Shop Manager

## Description

The Shop Manager manages merchandise and orders.

## Responsibilities

* Manage products.
* Manage product availability.
* Manage product restrictions.
* Process click-and-collect orders.
* Mark orders as collected.

## Permissions

Can:

* Create products.
* Edit products.
* Upload product images.
* Set product visibility.
* Restrict products to OHB, HOK or public.
* View merchandise orders.
* Update order status.
* Mark orders as ready for collection.
* Mark orders as collected.

May be allowed to:

* Manage stock quantities.
* Export merchandise reports.
* Process merchandise refunds.

Cannot:

* Manage members.
* Change membership benefits.
* Manage events.
* View unrelated financial reports unless granted.

---

# 11. Gate Staff

## Description

Gate Staff are volunteers or staff members responsible for admitting people at events.

This role must have the simplest interface in the entire platform.

## Responsibilities

* Scan tickets.
* Scan membership cards where required.
* Sell walk-in tickets.
* Record cash or card gate sales.
* Admit visitors.

## Permissions

Can:

* Access scanner page.
* Select assigned event.
* Scan ticket QR codes.
* Scan membership QR codes.
* Sell walk-in tickets.
* Record cash sales.
* Record card sales.
* Admit visitors.
* View basic scan result.

Cannot:

* View full member profiles.
* Edit member information.
* View financial reports.
* Export data.
* Change ticket prices.
* Create events.
* Delete events.
* Manage users.
* Access admin dashboard.

## Gate Staff Interface Rule

The Gate Staff interface should ideally contain only:

* Select Event
* Scan Ticket
* Scan Membership
* Sell Walk-In Ticket
* Admit
* Deny

No unnecessary features should be visible.

---

# 12. Member

## Description

A Member is an approved OHB or HOK member.

## Responsibilities

* Keep personal information updated.
* Maintain membership status.
* Use membership benefits responsibly.
* Purchase or claim tickets.
* Purchase merchandise where eligible.

## Permissions

Can:

* Login.
* View own profile.
* Edit own basic contact details.
* View digital membership card.
* View membership QR code.
* View benefits.
* View events.
* Buy tickets.
* Claim eligible free tickets.
* Buy eligible merchandise.
* View own orders.
* View own tickets.
* Download tickets.
* View renewal status.

Cannot:

* View other members.
* Access admin dashboard.
* Edit benefits.
* Edit events.
* Edit ticket prices.
* Access reports.
* Change own membership status manually.

---

# 13. Public User

## Description

A Public User is someone who creates an account but is not an active OHB or HOK member.

Examples:

* Parent
* Supporter
* Community member
* Event attendee
* Future member

## Permissions

Can:

* Create account.
* Buy public tickets.
* View public events.
* View public merchandise.
* Apply for membership.
* View own ticket history.
* View own orders.

Cannot:

* Access member-only benefits.
* Purchase member-only merchandise.
* Receive member pricing.
* Access membership QR card unless approved.
* Access admin features.

---

# 14. Guest User

## Description

A Guest User is someone who uses the system without creating an account.

## Permissions

Can:

* View public events.
* Buy public tickets through guest checkout.
* Receive ticket by email.
* View public information.

Cannot:

* Access member dashboard.
* Access member benefits.
* Buy member-only merchandise.
* View purchase history through portal.
* Access admin features.

---

# 15. Multiple Roles

The system should allow one user to hold multiple roles if required.

Example:

A person may be:

* OHB Admin
* Event Manager
* Member

The system must combine permissions safely.

If a user has multiple roles, they should only receive the permissions explicitly granted by those roles.

---

# 16. Role-Based Navigation

The user interface must adapt to the user's role.

Example:

Gate Staff should see:

* Scanner
* Gate Sales

School Admin should see:

* Dashboard
* Members
* Events
* Tickets
* Merchandise
* Reports
* Settings

Member should see:

* My Card
* My Benefits
* My Tickets
* Events
* Shop
* Profile

---

# 17. Sensitive Actions

The following actions should require elevated permission:

* Delete member
* Cancel membership
* Refund payment
* Change ticket price
* Delete event
* Change user role
* Export member data
* Override ticket scan
* Regenerate membership QR
* Access audit logs

These actions should be logged.

---

# 18. Audit Logging

Important actions must create audit logs.

Examples:

* User created
* User role changed
* Member approved
* Member suspended
* Ticket refunded
* Event deleted
* Product deleted
* Payment manually marked as paid
* Ticket scan overridden
* Membership QR regenerated

Audit logs should store:

* User who performed action
* Action performed
* Date and time
* Affected record
* Previous value where applicable
* New value where applicable

---

# 19. Security Notes

The system must prevent privilege escalation.

A user must never be able to access another user's information by manually changing URLs.

Role checks must happen on the server side, not only in the interface.

Supabase Row Level Security should be used wherever possible.

---

# 20. Open Questions

These questions must be confirmed before final development:

1. Who will be the first School Admin?
2. Who may approve memberships?
3. Can OHB Admins approve OHB members without school approval?
4. Can HOK Admins approve HOK members without school approval?
5. Who may issue free tickets?
6. Who may refund payments?
7. Who may export member data?
8. Should Gate Staff accounts expire after an event?
9. Should volunteers use personal logins or shared gate logins?
10. Should Finance users be allowed to edit payment statuses manually?

---

# 21. Acceptance Criteria

This role system is complete when:

* Every user has at least one role.
* Every protected screen checks user role.
* Users only see features relevant to their role.
* Gate Staff cannot access admin functions.
* Members cannot view other members.
* Public Users cannot access member benefits.
* Sensitive actions require elevated permissions.
* Role changes are logged.
* The system supports multiple roles per user.
