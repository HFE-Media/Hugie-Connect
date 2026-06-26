# 04 – User Flows

**Project:** Hugie Connect

**Version:** 0.1

**Status:** Draft

---

# 1. Purpose

This document defines how users interact with the platform.

Each flow represents a complete business process from start to finish.

The purpose is to ensure that:

* Every workflow is understood.
* Developers know exactly how users move through the system.
* Business rules are applied consistently.
* No important steps are forgotten.

If a workflow changes, this document must be updated before implementation.

---

# 2. User Flow Standards

Every flow should define:

* Actor
* Trigger
* Preconditions
* Main Flow
* Alternative Flows
* Error Handling
* Final Result

---

# FLOW 1 — New Member Registration

### Actor

Prospective Member

### Trigger

Clicks **Join OHB** or **Join HOK**

### Preconditions

* User is not already an active member.

### Main Flow

1. User selects membership type.
2. User completes online application.
3. User accepts terms and conditions.
4. User submits application.
5. System creates a Pending membership.
6. Confirmation email is sent.
7. Finance/payment process occurs.
8. Membership is approved.
9. Digital membership card is generated.
10. Welcome email is sent.
11. Member may now log in.

### Alternative Flows

* Application rejected.
* Payment fails.
* Duplicate application detected.

### Result

Member becomes Active.

---

# FLOW 2 — Member Login

### Actor

Member

### Main Flow

1. Open website.
2. Click Login.
3. Enter email/password.
4. Authenticate.
5. Redirect to dashboard.

Dashboard displays:

* Membership status
* Digital card
* Benefits
* Events
* Shop
* Tickets

---

# FLOW 3 — Renew Membership

### Actor

Existing Member

### Main Flow

1. Login.
2. Membership nearing expiry.
3. Renewal reminder displayed.
4. User renews membership.
5. Payment confirmed.
6. Membership extended.
7. Status remains Active.

Alternative:

Payment unsuccessful.

System keeps Pending Renewal until expiry.

---

# FLOW 4 — View Membership Card

### Actor

Member

### Main Flow

1. Login.
2. Open "My Membership Card".
3. System loads:

* Name
* Membership Number
* Membership Type
* Status
* QR Code

Member may:

* Show QR
* Download card
* Save for later

---

# FLOW 5 — Purchase Public Ticket

### Actor

Parent / Public User

### Main Flow

1. Visit Events page.
2. Select event.
3. Select Public Ticket.
4. Enter attendee details.
5. Pay.
6. Ticket created.
7. QR generated.
8. Ticket emailed.

Result:

Ready for gate scanning.

---

# FLOW 6 — Member Purchases Discounted Ticket

### Actor

OHB Member

### Preconditions

Membership Active.

### Main Flow

1. Login.
2. Select event.
3. System identifies OHB membership.
4. Discounted ticket shown.
5. Member pays.
6. Ticket created.
7. QR generated.
8. Ticket stored under "My Tickets".

---

# FLOW 7 — HOK Member Claims Free Rugby Ticket

### Actor

HOK Member

### Preconditions

Membership Active.

### Main Flow

1. Login.
2. Open Rugby Event.
3. System recognises HOK benefits.
4. Price becomes R0.
5. Member claims ticket.
6. Ticket generated.
7. Ticket appears in dashboard.
8. QR ready for gate.

---

# FLOW 8 — Walk-In Cash Sale

### Actor

Gate Staff

### Main Flow

1. Open Scanner Portal.
2. Select event.
3. Click Sell Ticket.
4. Select ticket type.
5. Select Cash.
6. Receive payment.
7. Ticket generated.
8. Visitor admitted.
9. Sale recorded.

Alternative:

Card payment.

Same flow.

---

# FLOW 9 — Ticket Validation

### Actor

Gate Staff

### Main Flow

1. Scan ticket QR.
2. System checks:

* Event
* Ticket validity
* Already scanned?
* Cancelled?
* Refunded?

If valid:

Green screen.

Tap Admit.

Scan logged.

Alternative:

Already used.

Red screen.

Admission denied.

---

# FLOW 10 — Membership Verification

### Actor

Gate Staff

### Main Flow

1. Scan Membership QR.
2. System loads:

Name

Membership Type

Status

Available Benefits

If Active

Green screen.

If Expired

Red screen.

---

# FLOW 11 — Purchase Member Merchandise

### Actor

Member

### Preconditions

Active membership.

### Main Flow

1. Login.
2. Open Shop.
3. Member-only products displayed.
4. Select item.
5. Checkout.
6. Payment.
7. Order created.
8. Click & Collect notification later.

Alternative:

Membership expired.

Product hidden.

---

# FLOW 12 — Public Merchandise Purchase

### Actor

Public User

### Main Flow

1. Browse Shop.
2. Public products only.
3. Checkout.
4. Payment.
5. Order confirmed.

---

# FLOW 13 — Admin Approves Membership

### Actor

School Admin

### Main Flow

1. Open Pending Members.
2. Review application.
3. Verify payment.
4. Approve.
5. Membership Number generated.
6. QR generated.
7. Welcome email sent.
8. Member becomes Active.

Alternative:

Reject.

Reason recorded.

---

# FLOW 14 — Event Creation

### Actor

Event Manager

### Main Flow

1. Create Event.
2. Enter:

Name

Date

Venue

Capacity

Description

3. Add ticket types.
4. Configure pricing.
5. Configure member discounts.
6. Publish event.

---

# FLOW 15 — Gate Opening

### Actor

Gate Staff

### Main Flow

1. Login.
2. Select assigned event.
3. Scanner opens.
4. Ready to scan.
5. Sell tickets if needed.
6. Admit visitors.

---

# FLOW 16 — Membership Expiry

### Actor

System

### Main Flow

1. Membership reaches expiry.
2. Reminder sent.
3. Grace period begins.
4. No payment received.
5. Status changes to Expired.
6. Benefits disabled.
7. Member prompted to renew.

---

# FLOW 17 — Refund Ticket

### Actor

Finance

### Main Flow

1. Locate ticket.
2. Verify eligibility.
3. Process refund.
4. Ticket invalidated.
5. Refund logged.
6. Customer notified.

---

# FLOW 18 — Scan Already Used Ticket

### Actor

Gate Staff

### Main Flow

1. Scan ticket.
2. System detects previous scan.
3. Display:

Already Used

Time of previous scan

Gate location (future)

4. Admission denied.

Override only by authorised admin.

---

# FLOW 19 — View Reports

### Actor

School Admin

### Main Flow

1. Login.
2. Open Reports.
3. Select report.
4. Apply filters.
5. Generate.
6. Export PDF or Excel.

---

# FLOW 20 — Future Multi-School Flow

Reserved.

Future white-label platform.

No implementation Version 1.

---

# Master Journey Map

Prospective Member

↓

Application

↓

Approval

↓

Membership Card

↓

Benefits

↓

Events

↓

Tickets

↓

Gate Entry

↓

Merchandise

↓

Renewal

↓

Long-Term Community Engagement

---

# Open Questions

The following workflows require confirmation before development:

* Membership cancellation.
* Membership transfer.
* Family memberships.
* Complimentary tickets.
* Sponsor tickets.
* Group ticket purchases.
* Waiting lists.
* Event capacity reached.
* Offline gate scanning.
* Failed payment recovery.
* Lost membership card.
* QR regeneration.

---

# Acceptance Criteria

This document is complete when:

* Every major business process has a documented flow.
* All alternative paths are considered.
* Developers can implement workflows without guessing.
* School stakeholders agree the flows match real operations.
* Future workflows can be added without restructuring the document.
