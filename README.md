# Hugie Connect

Hugie Connect is a modern community management platform for memberships, events, ticketing, access control, merchandise, reporting, and administration.

The first implementation is for Hoerskool Hugenote, OHB, and HOK, but the product is being built as an organisation-aware SaaS platform that can later support other schools, clubs, and community organisations.

## Current Status

Current phase: **Sprint 01 - Authentication & Users**

Sprint 01 establishes authentication, protected route shells, profile foundation, and role-aware permissions only. It does not include memberships, events, tickets, QR codes, gate scanning workflows, merchandise, payments, or reports.

## Stack

- Next.js App Router
- React
- TypeScript
- Tailwind CSS
- shadcn/ui conventions
- Supabase Auth foundation
- Supabase SSR helpers
- next-themes
- Zod environment validation

## Project Structure

```text
app/                Next.js App Router routes and layouts
components/         Reusable UI and provider components
features/           Future feature modules
hooks/              Shared React hooks
lib/                Shared utilities, env validation, logging, errors
services/           External service clients and service boundaries
styles/             Shared style assets
supabase/           Future Supabase schema and migration assets
types/              Shared TypeScript types
utils/              Future pure utility modules
docs/               Source-of-truth project documentation
```

## Getting Started

Install dependencies:

```bash
npm install
```

Create a local environment file:

```bash
cp .env.example .env.local
```

Fill in the required Supabase values, then run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment Variables

Required for Supabase-backed runtime paths:

```text
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
```

Optional server-only key for future trusted backend operations:

```text
SUPABASE_SERVICE_ROLE_KEY
```

Never expose the service role key to browser code.

## Available Scripts

```bash
npm run dev         # Start local development server
npm run build       # Create production build
npm run start       # Start production server after build
npm run lint        # Run ESLint
npm run type-check  # Run TypeScript without emitting files
```

## Sprint 01 Scope

Included:

- Next.js App Router
- TypeScript strict mode
- Tailwind CSS
- shadcn/ui-compatible component setup
- Project folder structure
- Supabase browser/server/middleware client setup
- Login page
- Logout
- Forgot password page
- Password reset flow foundation
- Authentication session handling
- Protected route structure
- Auth guard
- Role and permission utility foundation
- User profile foundation
- Auth-aware navigation states
- Theme provider
- Root layout
- Environment variable validation
- Logger utility
- Error handling utility and route boundary
- Path aliases
- Basic auth-aware landing page

Excluded until later milestones:

- Memberships
- Events
- Tickets
- QR codes
- Gate scanner
- Merchandise
- Payments
- Reports

## Development Principle

Documentation in `/docs` is the source of truth. Before building any future milestone, review the relevant documentation and keep implementation aligned with the roadmap.
