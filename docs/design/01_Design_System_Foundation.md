# 01 – Design System Foundation

**Project:** Hugie Connect
**Version:** 0.1
**Status:** Draft

---

# 1. Purpose

This document defines the visual and interaction foundation for Hugie Connect.

The goal is to make the platform feel like a premium SaaS product, not a basic school admin system.

---

# 2. Brand Feeling

The platform must feel:

* Premium
* Trustworthy
* Fast
* Clean
* Modern
* Community-focused
* Professional
* Mobile-first

---

# 3. Design Inspiration

Use inspiration from:

* Linear
* Vercel
* Stripe
* Supabase
* Notion
* Framer
* GitHub

Avoid:

* Old school portals
* Government-style systems
* Generic Bootstrap dashboards
* Crowded admin panels
* Cheap template layouts

---

# 4. Visual Direction

The UI should use:

* Clean white or near-white backgrounds
* Deep navy / charcoal sections
* Soft gradients used sparingly
* Premium accent colour
* Large rounded cards
* Subtle borders
* Soft shadows
* Clear spacing
* Modern typography

---

# 5. Colour Philosophy

Colours must communicate function.

Primary colour:

Used for main actions, links and active states.

Secondary colour:

Used for supporting brand identity.

Success colour:

Used for active memberships, successful scans and completed payments.

Warning colour:

Used for pending items and alerts.

Danger colour:

Used for expired memberships, invalid tickets and destructive actions.

Neutral colours:

Used for backgrounds, borders and text.

---

# 6. Suggested Base Palette

This can later be adjusted to match Hugenote branding.

```text
Primary: Deep Navy
#0B1F3A

Secondary: Royal Blue
#1D4ED8

Accent: Gold
#D4AF37

Success: Green
#16A34A

Warning: Amber
#F59E0B

Danger: Red
#DC2626

Background: Off White
#F8FAFC

Surface: White
#FFFFFF

Text Primary: Charcoal
#111827

Text Secondary: Slate
#64748B

Border: Light Grey
#E5E7EB
```

---

# 7. Typography

Use a clean modern font.

Recommended:

* Inter
* Geist
* Manrope

Typography rules:

* Headings must be strong and clear.
* Body text must be easy to read.
* Avoid decorative fonts.
* Avoid thin text for important UI.
* Use consistent font sizes.

---

# 8. Spacing

Use generous spacing.

The platform should never feel cramped.

Recommended spacing scale:

```text
4px
8px
12px
16px
24px
32px
48px
64px
96px
```

Most cards should use 24px padding on desktop and 16px on mobile.

---

# 9. Border Radius

Use modern rounded corners.

Suggested:

```text
Small: 8px
Medium: 12px
Large: 16px
Extra Large: 24px
```

Cards should generally use 16px–24px radius.

Buttons should use 10px–14px radius.

---

# 10. Shadows

Use shadows subtly.

Avoid harsh shadows.

Cards should mostly rely on:

* Light border
* Soft shadow
* Background contrast

---

# 11. Buttons

Button types:

* Primary
* Secondary
* Outline
* Ghost
* Danger

Primary buttons are used for the main action on a screen.

Examples:

* Approve Member
* Buy Ticket
* Claim Ticket
* Save Changes
* Admit

Danger buttons are only used for destructive actions.

Examples:

* Delete Event
* Cancel Membership
* Refund Ticket

---

# 12. Cards

Cards are a major design element.

Use cards for:

* Member summaries
* Digital membership cards
* Event previews
* Ticket previews
* Product previews
* Dashboard stats
* Reports
* Benefits

Cards should include:

* Clear title
* Supporting description
* Status badge where relevant
* Primary action where relevant

---

# 13. Badges

Badges communicate status.

Examples:

```text
Active
Pending
Expired
Suspended
Paid
Unpaid
Used
Valid
Invalid
Members Only
OHB Only
HOK Only
```

Badge colours must be consistent.

---

# 14. Tables

Tables should be clean and usable.

Required table features:

* Search
* Filters
* Sorting
* Pagination
* Status badges
* Row actions
* Empty state

Tables must not look cramped.

---

# 15. Forms

Forms should be simple.

Rules:

* One clear label per field.
* Helpful placeholder text.
* Required fields clearly marked.
* Validation displayed near the field.
* Save button always obvious.
* Avoid huge intimidating forms.

Use multi-step forms for long workflows.

---

# 16. Modals & Dialogs

Use dialogs for:

* Confirm delete
* Confirm refund
* Confirm suspend
* View QR
* Quick edit
* Gate sale confirmation

Never use dialogs for complex workflows that need full pages.

---

# 17. Navigation

Desktop Admin:

* Sidebar navigation
* Top bar with search/profile/actions

Mobile Admin:

* Collapsible menu

Member Portal Mobile:

* Bottom navigation preferred

Gate Portal:

* Minimal navigation only

---

# 18. Icons

Use Lucide Icons.

Icon rules:

* Icons must support meaning, not replace labels.
* Never use icons alone for critical actions.
* Use consistent stroke width.
* Avoid mixing icon libraries.

---

# 19. Motion

Animation must be subtle.

Use for:

* Page transitions
* Button feedback
* Card hover
* Modal open/close
* Scanner result state

Avoid:

* Heavy animations
* Distracting motion
* Slow transitions

---

# 20. Mobile-First Rules

Every screen must work on mobile.

Critical mobile workflows:

* Member views card
* Member claims ticket
* Member shows QR
* Parent buys ticket
* Gate staff scans ticket
* Gate staff sells walk-in ticket

No horizontal scrolling.

Large tap targets.

Clear spacing.

---

# 21. Gate Scanner Design Rules

Gate Scanner must be extremely simple.

The scanner screen should show:

* Current event
* Large scan area
* Last scan result
* Admit/Deny state
* Sell ticket button

Scan results must be colour-coded:

Green:

Valid / Admit

Red:

Invalid / Deny

Orange:

Warning / Needs Review

---

# 22. Digital Membership Card Design

The membership card should feel official.

Card should include:

* Organisation logo
* Member name
* Membership type
* Member number
* Status
* Valid until
* QR code

Use premium styling.

Card variants:

* OHB
* HOK

---

# 23. Ticket Design

Tickets should include:

* Event name
* Date
* Venue
* Ticket type
* Attendee name
* QR code
* Ticket status

Ticket must be easy to show at the gate.

---

# 24. Empty States

Every empty state should guide the user.

Examples:

No Events:

"No events have been created yet."

Button:

Create Event

No Tickets:

"You do not have any tickets yet."

Button:

Browse Events

No Members:

"No members found."

Button:

Add Member

---

# 25. Error States

Errors should be human-readable.

Bad:

"500 internal server error"

Good:

"Something went wrong while loading members. Please try again."

---

# 26. Success States

Success feedback should be clear.

Examples:

* Member approved successfully.
* Ticket created successfully.
* Order marked as collected.
* Scan recorded successfully.

---

# 27. Final Design Principle

Every screen should feel like it belongs to the same product.

If a screen looks visually disconnected, redesign it before implementation.
