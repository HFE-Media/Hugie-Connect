# 02 – Business Requirements

**Project:** Hugie Connect

**Version:** 0.1

**Status:** Draft

---

# 1. Purpose

This document defines how the business operates.

It describes the rules, processes, workflows and expected behaviour of the software.

This document should always take precedence over implementation decisions.

If business requirements conflict with technical implementation, the business requirements must be reviewed before development continues.

---

# 2. Business Overview

Hoërskool Hugenote currently operates two membership programmes.

## OHB

Oud Hugie Bond

Purpose:

Maintain relationships with former learners.

Typical benefits include:

* Alumni networking
* Reunion events
* Discounted school functions
* Priority ticket access
* Exclusive OHB merchandise

---

## HOK

Hugie Ondersteuners Klub

Purpose:

Allow parents and supporters to financially support the school while receiving member benefits.

Typical benefits include:

* Free sports entry
* Discounted events
* Exclusive supporter merchandise
* Community engagement

---

# 3. Business Goals

The platform should help the school:

* Increase memberships.
* Reduce administration.
* Increase event attendance.
* Increase merchandise sales.
* Improve reporting.
* Strengthen community engagement.
* Create recurring revenue.
* Improve member experience.

---

# 4. Membership Types

The system must support configurable membership types.

Version 1 includes:

* OHB
* HOK

Future versions should allow additional membership types without software changes.

Membership types must be configurable by administrators.

---

# 5. Membership Status

Every member must have a status.

Minimum statuses:

Pending

Active

Suspended

Expired

Cancelled

Only Active members receive benefits.

---

# 6. Membership Lifecycle

Example lifecycle.

Person submits application.

↓

Application received.

↓

Payment confirmed.

↓

Membership approved.

↓

Digital membership card generated.

↓

Welcome email sent.

↓

Member becomes Active.

↓

Membership renewed annually or monthly.

↓

If payment fails:

Status becomes Expired after grace period.

---

# 7. Member Information

Minimum member information:

* First Name
* Last Name
* Email
* Mobile Number
* Membership Type
* Membership Number
* Join Date
* Membership Status

Optional fields may be added later.

---

# 8. Digital Membership Card

Every Active member receives a digital membership card.

The card should display:

* Name
* Membership Number
* Membership Type
* Status
* QR Code

The membership QR remains constant unless regenerated.

---

# 9. Member Benefits

Benefits belong to membership types.

Not individual members.

Example:

OHB

* Men's Night Discount
* Golf Day Discount
* Priority Ticket Sales

HOK

* Free Rugby Entry
* Merchandise Discount

Administrators must be able to modify benefits without changing software code.

---

# 10. Events

The system must support multiple event types.

Examples:

Sports

* Rugby
* Hockey
* Athletics

Functions

* Men's Night
* Golf Day
* Reunions
* Fundraisers
* Dinners

Events should be configurable.

---

# 11. Ticket Types

Each event may contain multiple ticket types.

Example:

Adult

Learner

VIP

OHB Member

HOK Member

Public

Ticket pricing must be configurable.

---

# 12. Online Ticket Sales

Public users must be able to purchase tickets online.

Members must automatically receive applicable pricing.

Guest checkout should be supported.

Registered accounts are optional for public ticket buyers.

---

# 13. Member Ticket Benefits

Members should never manually enter coupon codes.

The platform automatically determines eligibility.

Examples:

OHB

* Discounted ticket

HOK

* Free sports ticket

Public

* Full price

---

# 14. Walk-In Gate Sales

The platform must support gate sales.

Payment methods:

Cash

Card

Future:

Mobile payment

Every gate sale must be recorded.

---

# 15. Gate Verification

Gate staff must have a simplified interface.

Required actions:

* Scan membership QR.
* Scan ticket QR.
* Sell ticket.
* Admit visitor.

No unnecessary administration should be available.

---

# 16. Membership QR vs Ticket QR

These are separate concepts.

Membership QR

Purpose:

Identify member.

Ticket QR

Purpose:

Validate access to an event.

A member may own multiple tickets.

Each ticket is unique.

---

# 17. Merchandise

Products may belong to:

Public

OHB

HOK

Administrators must decide who may purchase each product.

Examples:

OHB Polo

OHB Only

Supporters Hoodie

HOK Only

School Cap

Public

---

# 18. Merchandise Orders

Version 1

Click & Collect

Future

Courier Delivery

Orders must remain linked to member accounts where applicable.

---

# 19. Reporting

Minimum reports:

Membership Growth

Active Members

Expired Members

Event Attendance

Ticket Sales

Gate Entries

Revenue

Merchandise Sales

Benefit Usage

Reports should be exportable.

---

# 20. Notifications

Version 1

Email

Future

WhatsApp

SMS

Push Notifications

Examples:

Membership Approved

Ticket Purchased

Order Ready

Renewal Reminder

---

# 21. User Roles

The system must support role-based permissions.

Minimum roles:

Super Admin

School Admin

Finance

OHB Admin

HOK Admin

Event Manager

Shop Manager

Gate Staff

Member

Public User

---

# 22. Business Rules

The following rules apply.

Only Active members receive benefits.

Membership benefits are determined by membership type.

Membership QR is permanent.

Ticket QR is event-specific.

Tickets may only be scanned once.

Walk-in sales must be recorded.

Gate scans must be logged.

Member-only merchandise cannot be purchased by inactive members.

Every important administrative action should be auditable.

---

# 23. Scalability Requirements

The software should support future growth.

Examples:

Additional membership types

Additional schools

Additional events

Multiple campuses

Multiple gates

Multiple payment providers

Additional merchandise categories

No redesign should be required to support these features.

---

# 24. Future Business Opportunities

Potential future modules:

Business Partner Directory

Member Marketplace

School Donations

Sponsor Portal

Volunteer Management

Fundraising Campaigns

Mobile App

White-label platform

These should influence architecture but should not delay Version 1.

---

# 25. Success Criteria

The software is successful when:

A new member can join online.

Membership approval is simple.

Digital cards are generated automatically.

Benefits apply automatically.

Gate verification takes only a few seconds.

Public ticket sales require minimal administration.

Reports are available instantly.

School staff spend significantly less time on manual administration.

The platform becomes the central system for community engagement.
