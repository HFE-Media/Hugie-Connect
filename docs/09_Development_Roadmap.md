# 09 – Development Roadmap

**Project:** Hugie Connect

**Version:** 0.2

**Status:** Draft

---

# 1. Purpose

This document defines the development roadmap for Hugie Connect.

Its purpose is to ensure that development happens in logical milestones rather than attempting to build the entire platform at once.

Each milestone must leave the software in a usable, testable and deployable state.

A milestone is only considered complete when all acceptance criteria have been met.

---

# 2. Development Philosophy

The project should be developed iteratively.

Each milestone should:

* Solve a real business problem.
* Be independently testable.
* Avoid breaking previous functionality.
* Leave the application in a working state.

Never start the next milestone until the current one has been tested and approved.

---

# 3. Milestone Overview

The project is divided into twelve milestones.

```text
Milestone 1
Project Foundation

↓

Milestone 2
Authentication & Users

↓

Milestone 3
Membership Management

↓

Milestone 4
Digital Membership Cards

↓

Milestone 5
Events

↓

Milestone 6
Payments Foundation

↓

Milestone 7
Ticketing

↓

Milestone 8
Gate Scanner

↓

Milestone 9
Merchandise

↓

Milestone 10
Reporting

↓

Milestone 11
Notifications

↓

Milestone 12
Production Readiness
```

---

# 4. Milestone 1 – Project Foundation

## Goal

Create a professional project foundation.

## Deliverables

* Next.js project
* TypeScript
* Tailwind
* shadcn/ui
* Supabase integration
* Authentication setup
* Folder structure
* Layout system
* Theme
* Navigation
* Environment variables
* Error handling
* Logging utilities

## Acceptance Criteria

Application runs locally.

Authentication configured.

Supabase connected.

Project structure approved.

---

# 5. Milestone 2 – Authentication & Users

## Goal

Allow secure login and role management.

## Deliverables

* Login
* Logout
* Forgot password
* User profiles
* Role management
* Route protection
* Permission middleware

## Acceptance Criteria

Users can login.

Users see correct portal.

Permissions enforced.

---

# 6. Milestone 3 – Membership Management

## Goal

Manage members professionally.

## Deliverables

* Membership applications
* Member approval
* Membership types
* Member search
* Member profile
* Membership status
* Member dashboard

## Acceptance Criteria

Admin can manage members.

Members can login.

Statuses work correctly.

---

# 7. Milestone 4 – Digital Membership Cards

## Goal

Generate secure digital membership cards.

## Deliverables

* Membership card
* Membership QR
* QR generation
* QR validation
* Card page
* QR regeneration

## Acceptance Criteria

Active members receive card.

QR scans successfully.

Expired cards fail validation.

---

# 8. Milestone 5 – Events

## Goal

Create and manage events.

## Deliverables

* Events module
* Event categories
* Event pages
* Capacity
* Event publishing

## Acceptance Criteria

Admin can create events.

Public can view published events.

---

# 9. Milestone 6 – Payments Foundation

## Goal

Establish the payment architecture required for memberships, ticketing and merchandise without integrating a specific payment provider yet.

## Deliverables

* Payments table
* Payment service structure
* Payment statuses
* Manual payment recording
* Payment references
* Payment abstraction layer
* Linking payments to memberships, tickets and orders

## Acceptance Criteria

Payments can be recorded.

Payments can be linked to memberships, tickets and merchandise.

Manual payments are supported.

The platform is ready for future integration with providers such as PayFast, Peach Payments or Stripe.

---

# 10. Milestone 7 – Ticketing

## Goal

Allow ticket sales for public users and members.

## Deliverables

* Ticket types
* Public ticket sales
* Member ticket sales
* Member discounts
* Complimentary tickets
* Ticket QR generation
* My Tickets

## Acceptance Criteria

Tickets generate successfully.

Member discounts are applied automatically.

Ticket QR codes validate successfully.

Payments link correctly to tickets.

---

# 11. Milestone 8 – Gate Scanner

## Goal

Provide a fast, secure and simple gate management experience.

## Deliverables

* Scanner portal
* Ticket scanner
* Membership scanner
* Walk-in ticket sales
* Scan logs
* Gate assignments

## Acceptance Criteria

Tickets validate correctly.

Membership cards validate correctly.

Walk-in sales are recorded.

Duplicate scans are prevented.

Gate Staff only access assigned events.

---

# 12. Milestone 9 – Merchandise

## Goal

Provide member and public merchandise sales.

## Deliverables

* Products
* Categories
* Member restrictions
* Orders
* Click & Collect
* Member-only merchandise

## Acceptance Criteria

Member restrictions work correctly.

Orders are created successfully.

Collection status is tracked.

Payments link correctly to merchandise orders.

---

# 13. Milestone 10 – Reporting

## Goal

Provide business insight.

## Deliverables

* Dashboard widgets
* Membership reports
* Attendance reports
* Revenue reports
* Merchandise reports
* Export tools

## Acceptance Criteria

Reports match database.

Exports work.

---

# 14. Milestone 11 – Notifications

## Goal

Improve communication.

## Deliverables

* Email notifications
* Renewal reminders
* Ticket confirmation
* Order confirmation

Future:

WhatsApp

SMS

Push

## Acceptance Criteria

Notifications sent automatically.

Delivery logged.

---

# 15. Milestone 12 – Production Readiness

## Goal

Prepare for launch.

## Deliverables

* Optimisation
* Security review
* Accessibility review
* Performance testing
* User acceptance testing
* Documentation review
* Production deployment

## Acceptance Criteria

Ready for school use.

---

# 16. Testing Strategy

Every milestone requires:

Functional Testing

Role Testing

Permission Testing

Mobile Testing

Regression Testing

No milestone should be considered complete without testing.

---

# 17. Versioning

Version numbers should follow Semantic Versioning.

Examples:

0.1.0

Planning

0.5.0

MVP nearing completion

1.0.0

First production release

1.1.0

Minor features

2.0.0

Major platform expansion

---

# 18. Parking Lot

Ideas that arise during development should not interrupt current milestones.

Instead:

Record them in:

docs/PARKING_LOT.md

Review after milestone completion.

---

# 19. Change Management

Changes should follow this process:

Idea

↓

Business Review

↓

Documentation Update

↓

Approval

↓

Development

↓

Testing

↓

Deployment

No feature should bypass documentation.

---

# 20. Success Criteria

The roadmap is successful when:

Development remains organised.

Scope creep is controlled.

Every milestone delivers business value.

The application is always in a working state.

The team always knows what comes next.
