# Hugie Connect Documentation

## Overview

Welcome to the Hugie Connect project documentation.

This documentation is the **single source of truth** for the project.

Every architectural decision, business rule, database change, UI implementation and development milestone must follow the documentation contained in this folder.

No implementation should contradict these documents.

If documentation and code ever conflict, the documentation must be reviewed before continuing development.

---

# Project Goal

Hugie Connect is a modern community management platform designed to manage:

- Memberships
- Digital Membership Cards
- Events
- Ticketing
- QR Access Control
- Gate Operations
- Merchandise
- Payments
- Reporting
- Administration

The platform is initially being developed for **Hoërskool Hugenote** to manage the **OHB (Oud Hugie Bond)** and **HOK (Hugie Ondersteuners Klub)**.

However, the software must be architected as a reusable platform that can later support multiple schools and organisations.

---

# Documentation Structure

The documents should be read in the following order:

## 00 – Product Principles

Defines the philosophy and guiding principles of the product.

Read first.

---

## 01 – Project Vision

Explains why the platform exists and the long-term vision.

---

## 02 – Business Requirements

Defines how the business operates.

Contains the core business rules.

---

## 03 – User Roles

Defines every system role and permission.

---

## 04 – User Flows

Defines how users interact with the system.

These workflows should drive implementation.

---

## 05 – Database Schema

Defines the database structure.

No schema changes should be made without reviewing this document.

---

## 06 – UI & UX Specification

Defines the overall user experience and design direction.

---

## 07 – Functional Specification

Defines every major screen, feature and behaviour.

Developers should reference this document throughout implementation.

---

## 08 – API & System Architecture

Defines the technical architecture of the application.

---

## 09 – Development Roadmap

Defines milestones and build order.

Development should always follow this roadmap.

---

## 10 – Codex Rules

Defines engineering standards and rules for AI-assisted development.

These rules should be followed throughout the project.

---

## MASTER_BUILD_PROMPT

Defines the initial instructions for Codex before development begins.

---

## Design Documentation

The `design/` directory contains the design system and HFE Design Language.

These documents define:

- Visual style
- Components
- Product philosophy
- Interaction patterns
- Future design standards

Every screen should follow these guidelines.

---

# Development Workflow

Every new feature should follow this process:

1. Review the relevant documentation.
2. Confirm business requirements.
3. Design the implementation.
4. Build the feature.
5. Test the feature.
6. Update documentation if necessary.
7. Commit the completed work.

Do not skip documentation.

---

# Development Principles

The project follows these core principles:

- Build a platform, not a one-off project.
- Prefer configuration over hardcoded logic.
- Keep the architecture modular.
- Write reusable components.
- Protect user data.
- Keep business logic out of UI components.
- Prioritise maintainability and scalability.
- Build incrementally.
- Test thoroughly.
- Preserve working functionality.

---

# Project Standards

The software should feel comparable to modern SaaS platforms.

Examples include:

- Stripe
- Linear
- Vercel
- Notion
- Supabase
- GitHub

The platform should never resemble a traditional school management system.

---

# Source of Truth

This documentation is considered the official project specification.

If implementation differs from the documentation:

- Stop development.
- Review the documentation.
- Clarify the intended behaviour.
- Update the documentation if approved.
- Continue development.

Never make assumptions.

---

# Long-Term Vision

Hugie Connect is the first implementation of a reusable community management platform.

Future versions should support:

- Multiple schools
- Clubs
- Alumni associations
- Supporter organisations
- Sports clubs
- Membership organisations

Every architectural decision should support this vision.