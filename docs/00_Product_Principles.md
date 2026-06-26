# 00 – Product Principles

**Project:** Hugie Connect
**Version:** 0.1
**Status:** Draft

---

# 1. Purpose

This document defines the decision-making principles for Hugie Connect.

Every business decision, design decision and technical decision must follow these principles.

If a feature conflicts with these principles, the feature must be redesigned before implementation.

---

# 2. Build a Platform, Not a One-Off Project

Hugie Connect must be built as a reusable platform.

Hoërskool Hugenote is the first implementation, but the software should be designed so that it can later be adapted for other organisations.

Avoid hardcoding school-specific logic.

Use configurable settings wherever possible.

---

# 3. Keep the System Modular

The platform must be divided into clear modules.

Core modules include:

* Authentication
* Members
* Membership Types
* Benefits
* Events
* Ticketing
* Gate Scanner
* Merchandise
* Payments
* Reports
* Notifications
* Admin Settings

Each module should be able to grow independently.

---

# 4. Do Not Hardcode Business Rules

Avoid hardcoding rules such as:

* HOK gets free rugby entry.
* OHB gets men's night discount.
* Only HOK may buy a hoodie.

Instead, these must be stored as configurable rules.

Example:

A benefit rule should define:

* Eligible membership type
* Event category
* Discount amount
* Access restriction
* Usage limit

---

# 5. Membership QR and Ticket QR Must Stay Separate

A membership QR identifies a member.

A ticket QR grants access to a specific event.

These concepts must never be merged.

This prevents future problems with:

* Event capacity
* Ticket reuse
* Refunds
* Attendance reporting
* Member-only benefits
* Public ticket sales

---

# 6. Mobile First

Most users will access the platform from a phone.

This includes:

* Members
* Parents
* Gate Staff
* Public ticket buyers

All important workflows must work properly on mobile.

Desktop is still important for administrators.

---

# 7. Gate Staff Experience Must Be Extremely Simple

Gate Staff should not see a full dashboard.

Their interface must be focused on:

* Select event
* Scan ticket
* Scan membership
* Sell walk-in ticket
* Admit or deny

No unnecessary options.

No complex menus.

No sensitive data.

---

# 8. Every Important Action Must Be Logged

The system must maintain accountability.

Actions to log include:

* Member approved
* Member suspended
* Payment manually updated
* Ticket refunded
* Ticket scan overridden
* Event deleted
* Product deleted
* User role changed

Audit logs protect the school, the platform owner and the users.

---

# 9. Security Must Be Server-Side

The interface may hide buttons, but security must never rely only on the frontend.

Role checks must happen server-side.

Database access must be protected with Row Level Security where possible.

Users must never access data by changing URLs manually.

---

# 10. Version 1 Must Be Launchable

Version 1 does not need every future feature.

It must simply solve the core problem well.

Version 1 should focus on:

* Member management
* Digital cards
* QR verification
* Basic events
* Basic ticketing
* Gate scanner
* Walk-in sales
* Basic reporting

Advanced features belong in later versions.

---

# 11. Avoid Scope Creep

New ideas should be placed into the Parking Lot unless they are required for Version 1.

A feature belongs in Version 1 only if it is required to launch the system successfully.

---

# 12. Configuration Over Custom Code

Where possible, administrators should configure behaviour instead of developers changing code.

Examples:

* Membership types
* Benefits
* Ticket prices
* Product restrictions
* Event categories
* Branding
* Notification templates

This makes the platform easier to reuse.

---

# 13. Design for Future Multi-Organisation Support

Even if Version 1 only supports one school, the system should include organisation-aware architecture.

Core records should include `organisation_id` where needed.

This allows the platform to grow into a white-label SaaS product later.

---

# 14. Keep the User Experience Premium

The software must not feel like an old admin system.

It should feel:

* Fast
* Clean
* Professional
* Secure
* Simple
* Modern

The goal is to create software that users enjoy using.

---

# 15. Build Milestone by Milestone

Do not build everything at once.

Every milestone must leave the software in a working state.

Recommended order:

1. Authentication and roles
2. Member management
3. Digital membership cards
4. QR scanner
5. Events
6. Ticketing
7. Gate sales
8. Merchandise
9. Payments
10. Reports

---

# 16. Prefer Clarity Over Cleverness

Code should be understandable.

Database naming should be clear.

Business rules should be readable.

Avoid over-engineering unless it solves a real future problem.

---

# 17. Every Feature Must Have a Business Reason

Do not add features because they sound impressive.

Every feature must answer:

* Who uses this?
* What problem does it solve?
* Is it required now?
* Can it be reused later?

---

# 18. Final Principle

The platform must help organisations manage communities, memberships, benefits, events, access and merchandise in one clean system.

Every decision should support that long-term product vision.
