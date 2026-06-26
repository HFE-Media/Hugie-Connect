# 02 – Component Guidelines

**Project:** Hugie Connect

**Version:** 1.0

**Status:** Draft

---

# Purpose

This document defines every reusable UI component used throughout the application.

The goal is consistency.

A component should be designed once and reused everywhere.

No duplicate UI should exist.

---

# Design Philosophy

Components should be:

* Reusable
* Predictable
* Accessible
* Responsive
* Beautiful
* Lightweight
* Easy to maintain

---

# Component Categories

The platform uses the following component groups.

## Foundations

Typography

Colours

Spacing

Icons

Grid

Layout

---

## Inputs

Text Input

Textarea

Select

Combobox

Search

Checkbox

Radio

Switch

Date Picker

Time Picker

File Upload

QR Scanner

---

## Navigation

Sidebar

Top Navigation

Breadcrumb

Tabs

Pagination

Bottom Navigation

Dropdown

Context Menu

---

## Feedback

Alert

Toast

Badge

Loading Spinner

Skeleton

Progress Bar

Status Indicator

---

## Data Display

Table

Card

Accordion

Timeline

Statistic Card

Charts

Avatar

QR Card

Ticket Card

Product Card

Member Card

Event Card

---

## Overlays

Dialog

Drawer

Popover

Tooltip

Command Palette

---

## Commerce

Shopping Cart

Checkout Summary

Order Card

Payment Summary

---

# Buttons

Buttons must always have one clear purpose.

Variants

Primary

Secondary

Outline

Ghost

Danger

Success

Loading

Icon

Size

Small

Medium

Large

Rules

Only one primary action per section.

Danger buttons require confirmation.

Disabled buttons must explain why.

---

# Cards

Cards are the primary layout element.

Types

Statistic Card

Member Card

Event Card

Ticket Card

Benefit Card

Product Card

Order Card

Report Card

Cards should contain:

Title

Supporting information

Status

Primary action

Optional secondary action

---

# Inputs

Every input should support:

Validation

Error message

Success state

Disabled state

Required state

Loading state

Consistent spacing

---

# Tables

Tables must support:

Sorting

Searching

Filtering

Pagination

Bulk actions

Responsive layout

Status badges

Sticky headers where useful

Empty states

---

# Dialogs

Use dialogs only for focused actions.

Examples

Delete confirmation

Refund confirmation

Approve member

View QR

Quick edit

Avoid putting full workflows inside dialogs.

---

# Drawers

Use drawers for:

Viewing details

Quick edits

Notifications

Filters

Do not use drawers for destructive actions.

---

# Badges

Badge Types

Active

Pending

Expired

Cancelled

Paid

Refunded

Valid

Invalid

Members Only

Public

Each badge must use a consistent colour.

---

# Alerts

Alert Types

Information

Success

Warning

Danger

Critical

Alerts should explain:

What happened

Why

What the user should do next

---

# Toast Notifications

Toasts should be short.

Examples

Saved successfully

Member approved

Ticket issued

Product updated

Avoid long messages.

---

# Statistic Cards

Dashboard statistic cards should include:

Icon

Title

Primary value

Trend

Comparison

Optional action

Examples

Total Members

Today's Ticket Sales

Revenue

Upcoming Events

Orders Awaiting Collection

---

# QR Components

There are two QR components.

Membership QR

Ticket QR

Never use one component for both without configuration.

Each should support:

Loading

Download

Fullscreen

Print

Validation status

---

# Ticket Card

Displays:

Event

Date

Venue

Ticket Type

Status

QR Code

Primary Action

Download

Add to Wallet (future)

---

# Member Card

Displays:

Name

Membership Type

Member Number

Status

Join Date

Expiry

Primary Action

View Profile

---

# Event Card

Displays:

Banner

Title

Date

Venue

Capacity

Availability

Primary Action

View Event

---

# Product Card

Displays:

Image

Name

Price

Eligibility

Availability

Primary Action

Add to Cart

---

# Dashboard Widgets

Widgets must be modular.

Examples

Revenue

Members

Events

Orders

Benefits

Notifications

Widgets should be rearrangeable in future.

---

# Charts

Recommended charts:

Line

Bar

Area

Donut

Avoid unnecessary chart types.

Always include legends.

---

# Search

Search components should support:

Keyboard navigation

Highlighted matches

Recent searches (future)

Debounced searching

---

# Empty States

Every component capable of displaying zero results must include:

Illustration

Title

Description

Primary action

---

# Loading States

Every asynchronous component requires:

Skeleton

Spinner where appropriate

Disabled interactions

Avoid layout shifts.

---

# Accessibility

Every component must support:

Keyboard navigation

Focus states

ARIA labels where required

Screen readers

High contrast

---

# Responsive Behaviour

Components must adapt to:

Desktop

Tablet

Mobile

Never simply shrink components.

Redesign layouts where necessary.

---

# Animation Rules

Use subtle motion only.

Examples

Hover

Press

Expand

Collapse

Fade

Slide

Avoid distracting animations.

---

# Naming Convention

Use consistent component names.

Examples

MemberCard

EventCard

TicketCard

BenefitCard

ProductCard

StatisticCard

Do not create duplicate versions unnecessarily.

---

# Future Components

Potential future additions:

WalletPass

SponsorCard

VolunteerCard

PartnerCard

DonationCard

SeatMap

TimelineActivity

LoyaltyBadge

---

# Final Principle

Every component should feel like it belongs to one unified design system.

If a component looks different from the rest of the platform, redesign it before implementation.
