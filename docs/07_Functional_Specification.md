# 07 – Functional Specification

**Project:** Hugie Connect
**Version:** 0.1
**Status:** Draft

---

# 1. Purpose

This document defines the main screens, features, actions, rules and expected behaviour of the Hugie Connect platform.

This is the primary reference document for developers when building the application screens.

---

# 2. Application Areas

The platform is divided into four main areas:

1. Public Website
2. Member Portal
3. Admin Portal
4. Gate Scanner Portal

Each area must share the same database but expose different functionality depending on user role.

---

# 3. Public Website

## 3.1 Home Page

### Purpose

Introduce the platform and direct users to membership, events and tickets.

### Main Sections

* Hero section
* OHB introduction
* HOK introduction
* Upcoming events
* Join membership call-to-action
* Buy tickets call-to-action
* Public merchandise call-to-action
* Contact information

### Actions

Users can:

* View events
* Buy public tickets
* Apply for OHB
* Apply for HOK
* Login

---

## 3.2 Membership Join Page

### Purpose

Allow users to apply for OHB or HOK membership.

### Components

* Membership type cards
* Benefits summary
* Price or contribution details
* Application form
* Terms acceptance
* Submit button

### Rules

* User must select membership type.
* Required fields must be completed.
* Duplicate email should be flagged.
* Application status starts as Pending.

---

## 3.3 Public Events Page

### Purpose

Display events available to the public.

### Components

* Event cards
* Search
* Category filter
* Date filter
* Ticket availability badge

### Actions

Users can:

* View event details
* Buy public tickets

---

## 3.4 Public Event Detail Page

### Purpose

Show details of a single event.

### Components

* Event name
* Date and time
* Venue
* Description
* Ticket types
* Pricing
* Capacity status
* Buy ticket button

### Rules

* Only published events show publicly.
* Sold-out ticket types must be disabled.
* Member pricing should prompt user to log in.

---

## 3.5 Public Ticket Checkout

### Purpose

Allow non-members and guests to purchase tickets.

### Components

* Ticket selection
* Attendee details
* Purchaser details
* Payment method
* Order summary
* Confirm purchase button

### Rules

* Email is required.
* Payment must be completed before ticket is valid.
* Ticket QR is generated after successful payment.
* Guest checkout must be supported.

---

# 4. Authentication

## 4.1 Login Page

### Purpose

Allow users to access their correct portal.

### Components

* Email input
* Password input
* Forgot password link
* Login button
* Register/apply link

### Rules

* After login, redirect based on user role.
* Admin users go to Admin Portal.
* Members go to Member Portal.
* Gate Staff go to Scanner Portal.

---

## 4.2 Forgot Password

### Purpose

Allow password reset.

### Components

* Email input
* Submit button
* Confirmation message

### Rules

* Do not reveal whether an email exists.
* Send reset email when applicable.

---

# 5. Member Portal

## 5.1 Member Dashboard

### Purpose

Provide a quick overview of the member’s account.

### Components

* Membership status card
* Digital membership card preview
* Benefits summary
* Upcoming events
* My tickets
* Recent orders
* Renewal reminder

### Actions

Member can:

* View card
* View benefits
* Buy tickets
* View orders
* Update profile
* Renew membership

---

## 5.2 Digital Membership Card

### Purpose

Display official OHB/HOK card.

### Components

* Member name
* Membership number
* Membership type
* Status
* QR code
* Valid until date
* Download/share option

### Rules

* Only Active members show valid status.
* Expired members show expired status.
* QR token must not expose sensitive data.

---

## 5.3 Benefits Page

### Purpose

Show all benefits available to the member.

### Components

* Benefit cards
* Eligibility status
* Usage rules
* Related events/products

### Rules

* Benefits are based on membership type and active status.
* Expired members can view benefits but cannot claim them.

---

## 5.4 My Tickets

### Purpose

Show tickets owned by the user.

### Components

* Upcoming tickets
* Past tickets
* QR code per ticket
* Event details
* Ticket status

### Rules

* Used tickets should be marked as used.
* Refunded tickets should be marked as refunded.
* Cancelled tickets should not be valid for entry.

---

## 5.5 Shop

### Purpose

Allow members to buy eligible merchandise.

### Components

* Product grid
* Category filter
* Membership restriction badges
* Product details
* Add to cart

### Rules

* OHB-only products show only to active OHB members.
* HOK-only products show only to active HOK members.
* Public products show to everyone.
* Expired members cannot buy member-only items.

---

## 5.6 Orders

### Purpose

Allow users to view merchandise orders.

### Components

* Order list
* Order number
* Status
* Payment status
* Collection status
* Order detail page

---

## 5.7 Profile

### Purpose

Allow users to manage personal details.

### Editable Fields

* First name
* Last name
* Mobile number
* Email if allowed
* Address if required

### Rules

* Member cannot change own membership type.
* Member cannot change own membership status.
* Critical changes may require admin review.

---

# 6. Admin Portal

## 6.1 Admin Dashboard

### Purpose

Provide school administrators with operational overview.

### Widgets

* Total members
* Active members
* Pending members
* Expired members
* Upcoming events
* Ticket sales
* Gate sales
* Merchandise orders
* Recent activity

---

## 6.2 Members List

### Purpose

Allow admins to search and manage members.

### Components

* Search
* Filters
* Member table
* Status badges
* Membership type filter
* Export button
* Add member button

### Actions

Admins can:

* View member
* Edit member
* Approve pending member
* Suspend member
* Export members

---

## 6.3 Member Detail Page

### Purpose

Show full member record.

### Sections

* Personal information
* Membership details
* Digital card
* Payment history
* Tickets
* Orders
* Audit history

### Actions

Admins can:

* Approve
* Suspend
* Expire
* Cancel
* Regenerate QR
* Edit details
* Add note

### Rules

* QR regeneration must be logged.
* Membership status changes must be logged.

---

## 6.4 Membership Types

### Purpose

Manage OHB, HOK and future membership types.

### Components

* Membership type list
* Name
* Code
* Price
* Billing cycle
* Status
* Benefits linked

### Actions

Admins can:

* Create membership type
* Edit membership type
* Disable membership type
* Link benefits

---

## 6.5 Benefits Management

### Purpose

Create and manage configurable benefits.

### Components

* Benefit list
* Benefit type
* Eligibility rules
* Linked membership types
* Status

### Benefit Types

* Free entry
* Discount
* Priority access
* Merchandise access
* Custom

### Rules

* Benefits must be configurable.
* Avoid hardcoding specific OHB/HOK logic.

---

## 6.6 Events Management

### Purpose

Create and manage events.

### Components

* Event list
* Create event form
* Event category
* Venue
* Date/time
* Capacity
* Status

### Actions

Admins can:

* Create event
* Edit event
* Publish event
* Cancel event
* View attendance
* View sales

---

## 6.7 Ticket Types Management

### Purpose

Configure ticket options per event.

### Fields

* Ticket name
* Description
* Price
* Quantity
* Visibility
* Membership restriction
* Status

### Rules

* Ticket types belong to events.
* Member-only ticket types require login.
* Free tickets must still generate ticket QR.

---

## 6.8 Merchandise Management

### Purpose

Manage shop products.

### Fields

* Product name
* Description
* Category
* Price
* Image
* Visibility
* Membership restrictions
* Status

### Actions

Admins can:

* Create product
* Edit product
* Disable product
* Manage eligibility
* View orders

---

## 6.9 Orders Management

### Purpose

Manage merchandise orders.

### Components

* Order list
* Payment status
* Collection status
* Customer details
* Order items

### Actions

Admins can:

* Mark paid
* Mark ready for collection
* Mark collected
* Cancel order

---

## 6.10 Reports

### Purpose

Provide operational and financial insights.

### Reports

* Membership growth
* Active members
* Expired members
* Ticket sales
* Event attendance
* Gate sales
* Merchandise sales
* Benefit usage

### Actions

Admins can:

* Filter
* Export CSV
* Export PDF in future

---

## 6.11 User Management

### Purpose

Manage staff and admin accounts.

### Components

* User list
* Role badges
* Status
* Invite user
* Edit roles

### Rules

* Role changes must be logged.
* Only authorised users can assign admin roles.

---

## 6.12 Settings

### Purpose

Manage organisation configuration.

### Settings

* Organisation name
* Logo
* Colours
* Contact details
* Payment settings
* Email templates
* Ticket settings
* Branding

---

## 6.13 Audit Logs

### Purpose

Track important actions.

### Components

* Log table
* User
* Action
* Entity
* Timestamp
* Old values
* New values

### Rules

* Logs should not be editable.
* Logs should not be deletable by normal admins.

---

# 7. Gate Scanner Portal

## 7.1 Gate Event Selection

### Purpose

Allow Gate Staff to select the event they are working on.

### Components

* Today’s events
* Assigned events
* Search event
* Start scanning button

### Rules

* Gate Staff should only see assigned or active events where possible.

---

## 7.2 Scanner Screen

### Purpose

Scan tickets and membership cards.

### Components

* Camera scanner
* Current event
* Scan result panel
* Large Admit button
* Large Deny state
* Recent scans

### Scan Results

Valid ticket:

* Green
* Show ticket type
* Show attendee name
* Admit

Already used ticket:

* Red
* Show previous scan time

Invalid ticket:

* Red
* Deny

Active member:

* Green
* Show member type
* Show benefits

Expired member:

* Red
* Show expired status

---

## 7.3 Walk-In Ticket Sale

### Purpose

Record cash/card sales at gate.

### Components

* Ticket type selector
* Quantity
* Payment method
* Amount
* Complete sale button

### Rules

* Sale must create ticket record.
* Sale must create gate sale record.
* Staff may admit immediately after sale.

---

# 8. Payments

## 8.1 Payment Handling

### Purpose

Record payments for memberships, tickets and merchandise.

### Payment Types

* Membership
* Ticket
* Merchandise
* Donation future

### Rules

* Payment status must be tracked.
* Manual payment updates require Finance permission.
* Refunds must invalidate related tickets where applicable.

---

# 9. Notifications

## 9.1 Email Notifications

### Version 1 Notifications

* Application received
* Membership approved
* Ticket purchased
* Order placed
* Order ready for collection
* Membership renewal reminder

### Rules

* Notification sending should be logged.
* Failed notifications should be retryable in future.

---

# 10. Global Requirements

## 10.1 Search

Search should exist for:

* Members
* Events
* Orders
* Tickets
* Products

## 10.2 Filtering

Tables should support filters where relevant.

## 10.3 Exporting

Reports and admin tables should support export where appropriate.

## 10.4 Validation

All forms must validate required fields.

## 10.5 Permissions

Every screen must enforce role-based access.

Frontend hiding is not enough.

Server-side checks are required.

---

# 11. Acceptance Criteria

This specification is complete when:

* Every main screen is documented.
* Every user role has appropriate screens.
* Every critical action is described.
* Business rules are represented in screen behaviour.
* Codex can build pages without guessing.
* Future features have a clear place to be added.
