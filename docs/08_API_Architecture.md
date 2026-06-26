# 08 – API & System Architecture

**Project:** Hugie Connect

**Version:** 0.1

**Status:** Draft

---

# 1. Purpose

This document defines the overall software architecture of Hugie Connect.

It explains how the frontend, backend, database and external services communicate.

The architecture must prioritise:

* Scalability
* Security
* Maintainability
* Reusability
* Performance

---

# 2. High-Level Architecture

The platform consists of five primary layers:

```text
Browser / Mobile Device
        │
        ▼
Next.js Frontend
        │
        ▼
Business Logic Layer
        │
        ▼
Supabase Services
        │
        ▼
PostgreSQL Database
```

External services connect where required.

---

# 3. Technology Stack

## Frontend

* Next.js
* React
* TypeScript
* Tailwind CSS
* shadcn/ui

---

## Backend

* Supabase
* PostgreSQL
* Supabase Auth
* Supabase Storage
* Supabase Edge Functions (when required)

---

## Hosting

Frontend:

* Vercel

Backend:

* Supabase Cloud

---

# 4. Architectural Principles

The system should follow:

* Separation of concerns
* Reusable components
* Reusable business logic
* Small independent modules
* Clean folder structure

Avoid:

Large monolithic files.

Business logic inside UI components.

Duplicated logic.

---

# 5. Frontend Responsibilities

The frontend should:

* Render UI
* Validate user input
* Display data
* Handle navigation
* Manage local state
* Display loading states
* Display success/error messages

The frontend must NOT be trusted for security.

---

# 6. Backend Responsibilities

The backend should:

* Authenticate users.
* Authorise requests.
* Validate permissions.
* Execute business rules.
* Access the database.
* Generate QR tokens.
* Send notifications.
* Process payments.

---

# 7. Database Responsibilities

The database stores:

* Members
* Events
* Tickets
* Products
* Orders
* Payments
* Reports
* Audit logs

Business rules should not rely only on database constraints.

---

# 8. Authentication

Authentication uses:

Supabase Auth.

Supported methods:

Email & Password

Future:

Google

Apple

Microsoft

Magic Links

---

# 9. Authorisation

Authentication answers:

Who are you?

Authorisation answers:

What are you allowed to do?

Role checks must happen server-side.

---

# 10. API Design Principles

The application should expose logical service methods.

Example modules:

Authentication

Members

Events

Tickets

Shop

Payments

Reports

Notifications

Each module should remain independent.

---

# 11. Service Layer

Business logic should exist inside services.

Example:

MemberService

Responsibilities:

* Create member
* Renew membership
* Approve member
* Suspend member

The UI should never contain business logic.

---

# 12. Ticket Service

Responsibilities:

* Create tickets
* Validate tickets
* Refund tickets
* Generate QR
* Prevent duplicate scans

---

# 13. Membership Service

Responsibilities:

* Apply
* Approve
* Renew
* Generate membership number
* Generate QR card
* Determine eligibility

---

# 14. Benefits Service

Responsibilities:

* Determine available benefits
* Apply discounts
* Validate member eligibility
* Restrict merchandise

No benefit logic should exist inside the UI.

---

# 15. Event Service

Responsibilities:

* Create event
* Publish event
* Cancel event
* Determine capacity
* Determine available tickets

---

# 16. Payment Service

Responsibilities:

* Create payment
* Verify payment
* Record payment
* Refund payment

Payment providers should be replaceable.

---

# 17. Notification Service

Responsibilities:

* Email
* Future WhatsApp
* Future SMS
* Future Push Notifications

The rest of the platform should not care how notifications are delivered.

---

# 18. QR Service

Responsibilities:

Generate secure QR tokens.

Membership QR.

Ticket QR.

Validate tokens.

Prevent forgery.

---

# 19. Scanner Service

Responsibilities:

Validate scans.

Determine:

* Valid
* Used
* Expired
* Refunded
* Invalid

Return scanner response.

---

# 20. Report Service

Responsibilities:

Aggregate data.

Generate reports.

Support exports.

Avoid placing reporting logic inside UI components.

---

# 21. Folder Structure

Recommended structure:

```text
app/

components/

features/

services/

hooks/

lib/

types/

utils/

styles/

public/

docs/
```

Business logic belongs in services.

---

# 22. Reusable Components

Examples:

Button

Input

Table

Card

Badge

Dialog

QRCard

TicketCard

EventCard

ProductCard

MemberCard

These should never be duplicated.

---

# 23. Error Handling

All services should return consistent error objects.

Errors should never expose internal details.

---

# 24. Logging

Important events should be logged.

Examples:

Login

Approval

Refund

Scan

Deletion

Role change

QR regeneration

---

# 25. Security

Every request must verify:

Authentication.

Role.

Organisation.

Record ownership where applicable.

Never trust client input.

---

# 26. Performance

Optimise:

Database queries.

Image loading.

Pagination.

Caching where appropriate.

Lazy loading.

Avoid unnecessary re-renders.

---

# 27. Future API Modules

Potential future services:

PartnerService

DonationService

WalletService

LoyaltyService

VolunteerService

SponsorService

AnalyticsService

These should not affect Version 1.

---

# 28. Multi-Organisation Support

Every organisation should be isolated.

No organisation should access another organisation's data.

Organisation awareness should exist throughout the architecture.

---

# 29. Offline Considerations

Future Version.

Gate Scanner should eventually support:

Offline scanning.

Offline queue.

Automatic synchronisation.

This should influence architecture but not delay Version 1.

---

# 30. Scalability

Architecture should comfortably support:

100,000+ members.

Multiple schools.

Thousands of tickets.

Thousands of scans per event.

Large merchandise catalogues.

---

# 31. Coding Standards

Use:

TypeScript everywhere.

Strong typing.

Small functions.

Reusable logic.

Consistent naming.

Readable code.

Avoid unnecessary abstraction.

---

# 32. Final Architecture Principle

Every module should be capable of evolving independently without requiring major changes to unrelated modules.

A change in merchandise should not affect ticketing.

A change in ticketing should not affect memberships.

Loose coupling should always be preferred.

---

# 33. Acceptance Criteria

Architecture is complete when:

* Modules are clearly separated.
* Business logic exists in services.
* Security is server-side.
* Future growth is supported.
* Frontend remains lightweight.
* Components are reusable.
* External integrations remain replaceable.
* Developers can understand the architecture without additional explanation.
