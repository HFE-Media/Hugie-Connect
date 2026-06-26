# 10 – Codex Rules

**Project:** Hugie Connect
**Version:** 0.1
**Status:** Draft

---

# 1. Core Instruction

You are working on Hugie Connect, a professional membership, ticketing, gate access and merchandise platform.

Do not treat this as a simple website.

Treat it as a commercial SaaS platform.

---

# 2. Read Documentation First

Before making changes, always read the relevant documents inside `/docs`.

The documentation is the source of truth.

If code and documentation conflict, stop and ask for clarification.

---

# 3. Do Not Guess Business Logic

Never invent rules.

If a business rule is unclear, ask before implementing.

Examples:

* Do not assume HOK always gets free entry.
* Do not assume OHB always gets discounts.
* Do not assume all events need tickets.
* Do not assume all merchandise is member-only.

Business logic must be configurable.

---

# 4. Build Platform-First

Do not hardcode:

* Hoërskool Hugenote
* OHB
* HOK
* School-specific event names
* School-specific discounts
* School-specific merchandise rules

Use generic, configurable structures.

---

# 5. Respect the Roadmap

Build only the requested milestone.

Do not jump ahead.

If asked to build Milestone 1, do not build ticketing, merchandise, payments or reports unless explicitly requested.

---

# 6. Preserve Working Code

Before changing anything:

1. Understand the existing implementation.
2. Preserve what already works.
3. Improve only the requested area.
4. Avoid unnecessary rewrites.

Do not redesign working sections without permission.

---

# 7. Use Clean Architecture

Keep business logic out of UI components.

Use:

* Services
* Utilities
* Types
* Reusable components
* Clear folder structure

Avoid:

* Large files
* Duplicated logic
* Hardcoded rules
* Messy components

---

# 8. Security Is Mandatory

Never rely on frontend-only security.

All sensitive actions must be protected by:

* Authentication
* Role checks
* Server-side validation
* Row Level Security where possible

Users must not access data by manually changing URLs.

---

# 9. Role-Based Access

Every protected screen must check permissions.

Examples:

* Gate Staff must not access Admin Reports.
* Members must not view other members.
* Public Users must not access member benefits.
* Finance Users must not edit roles unless explicitly allowed.

---

# 10. Audit Important Actions

Important actions must be logged.

Examples:

* Member approved
* Member suspended
* QR regenerated
* Ticket refunded
* Payment manually updated
* Event deleted
* Product deleted
* Role changed

---

# 11. Mobile First

Every feature must work on mobile.

Especially:

* Member dashboard
* Digital card
* Ticket QR
* Gate scanner
* Public checkout

Do not build desktop-only workflows.

---

# 12. Gate Scanner Must Stay Simple

The Gate Scanner Portal must be extremely simple.

It should not show full admin dashboards.

It should focus on:

* Select event
* Scan ticket
* Scan membership
* Sell walk-in ticket
* Admit or deny

---

# 13. Membership QR and Ticket QR Are Separate

Never merge these concepts.

Membership QR identifies a member.

Ticket QR grants access to one event.

This rule is non-negotiable.

---

# 14. Use TypeScript Strictly

Use TypeScript throughout the project.

Avoid `any` unless absolutely necessary.

Create shared types for:

* Users
* Members
* Events
* Tickets
* Products
* Orders
* Payments
* Roles

---

# 15. Reusable Components

Use reusable components for:

* Buttons
* Inputs
* Cards
* Tables
* Badges
* Dialogs
* Forms
* QR displays
* Event cards
* Ticket cards
* Product cards

Do not duplicate UI unnecessarily.

---

# 16. Consistent UI

Follow the UI/UX specification.

The platform should feel:

* Modern
* Premium
* Clean
* Fast
* Professional
* Simple

Avoid generic dashboards and cheap templates.

---

# 17. Loading, Empty and Error States

Every data-driven screen must include:

* Loading state
* Empty state
* Error state
* Success feedback

No blank broken screens.

---

# 18. Validate Forms Properly

Every form must have:

* Required fields
* Clear validation
* Helpful error messages
* Success feedback

Do not allow invalid data into the system.

---

# 19. Write Maintainable Code

Code must be readable.

Use clear names.

Keep files small.

Avoid clever shortcuts.

Prefer clarity over complexity.

---

# 20. Testing Mindset

After every milestone, check:

* Does it work?
* Does it respect roles?
* Does it work on mobile?
* Are errors handled?
* Did we break anything else?

---

# 21. Do Not Add Unrequested Features

Do not add features because they sound useful.

Use the Parking Lot.

Only build what is requested for the current milestone.

---

# 22. Document Important Changes

When making major changes, update relevant docs.

The documentation and code must remain aligned.

---

# 23. Ask Before Risky Changes

Ask before:

* Changing database schema
* Rewriting architecture
* Removing features
* Changing auth logic
* Changing role rules
* Changing payment logic
* Changing QR validation logic

---

# 24. Environment Variables

Never hardcode secrets.

Use environment variables for:

* Supabase URL
* Supabase anon key
* Supabase service role key
* Payment provider keys
* Email keys
* WhatsApp keys

Never commit secrets.

---

# 25. Final Rule

Your job is not to impress by building too much.

Your job is to build the right thing, cleanly, securely and in the correct order.
