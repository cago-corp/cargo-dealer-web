# AGENTS.md

This file provides guidance to agents working in the `cargo-web` repository.

## Overview

This repository is the dealer web frontend.
It is a web-first product and must not be treated as a direct Flutter port.

The goal of this file is to make agent behavior predictable:
- clear separation between route shell, feature UI, and data access
- server state and form state handled consistently
- App Router ownership kept explicit
- safe command execution
- consistent branch/commit workflow

This file defines hard rules.
Detailed examples and workflows live in `docs/`.

## Core Stack (Approval Required to Change)

- Next.js App Router
- React
- TypeScript (`strict` mode)
- TanStack Query for server state
- Zod for request/response and form validation
- Tailwind CSS for styling

Agents must not introduce alternative frameworks for routing, server state,
form validation, or styling foundations without explicit user approval.

## Architecture Rules (Summary)

### Package / Folder Roles

- `src/app/*`
  - Next.js App Router entrypoints only
  - layouts, pages, route handlers, metadata, route-level loading/error files
- `src/features/*`
  - feature-specific UI, hooks, local mappers, actions, queries
- `src/entities/*`
  - domain-facing types, schemas, display adapters shared across features
- `src/shared/*`
  - cross-cutting utilities, API client, auth/session helpers, UI primitives

### Dependency Direction (Required)

Allowed:
- `app -> features`
- `app -> entities`
- `app -> shared`
- `features -> entities`
- `features -> shared`
- `entities -> shared`

Forbidden:
- `shared -> features`
- `shared -> app`
- sibling feature imports unless explicitly approved
- route files importing from other route files

## Critical Rules (Do Not Violate)

- App Router ownership stays in `src/app/*`.
- Feature modules must not call browser-only APIs during server render.
- Route handlers must not contain UI-specific formatting logic.
- API response mapping must happen in `features/*` or `entities/*`, not in pages.
- Global shell state and feature business state must stay separate.
- A feature must not depend on another feature's internal implementation.
- Avoid copying Flutter screen structure 1:1 when web UX needs a different layout.

## Data / State Rules

- Use TanStack Query for server state, caching, invalidation, and mutations.
- Use local React state for small UI-only concerns.
- Introduce Zustand only when state must be shared across distant UI regions
  and does not belong to the URL or TanStack Query cache.
- Validate external payloads with Zod at the boundary.
- Treat API contracts as the source of truth, not Flutter widget behavior.

## Dependency Version Policy

- Third-party package versions must be declared in the root `package.json`.
- Use a single lockfile for the repository.
- Do not add multiple libraries for the same concern without approval.

## Command Safety

### Prohibited by Default (Unless User Approves)

- broad refactors touching unrelated features
- destructive file deletion outside task scope
- dependency or framework swaps

### Allowed Within Task Scope

- file edits / file moves / file creation
- targeted `pnpm test`, `pnpm lint`, `pnpm typecheck`
- targeted `pnpm exec playwright test`
- scoped dependency installation with user approval

## Validation Expectations

- Run the smallest relevant validation for the changed scope.
- Prefer feature-scoped checks over full-repo checks.
- If validation was not run, state it explicitly.

## Git / Branch / Commit Rules

- Never commit directly to `main` unless explicitly instructed.
- Assume work happens on a feature branch.
- Do not create commits unless the user asks.
- If a commit is requested and branch context is unclear, ask first.
- Follow `docs/GIT_WORKFLOW.md` when present.

## Agent Behavior Rules

- No guessing: ask if business rules or API ownership are unclear.
- Check `package.json` before adding new dependencies or scripts.
- If architecture ownership is unclear, read:
  1. `docs/ARCHITECTURE.md`
  2. `docs/DEVELOPMENT_CONVENTION.md`
  3. `docs/ROUTING.md`
- If a feature starts to mirror Flutter UI 1:1 without clear UX value, stop and
  propose a web-native alternative.
- Keep server components pure and thin.
- Move browser-only hooks and event handlers into client components.
- Prefer explicit data flow over implicit global state.

## References

- `docs/ARCHITECTURE.md`
- `docs/DEVELOPMENT_CONVENTION.md`
- `docs/ROUTING.md`
- `docs/TESTING.md`
- `docs/GIT_WORKFLOW.md`
- `docs/DEPENDENCY_POLICY.md`
- `docs/FEATURE_TEMPLATE.md`

## Scope

This file is for constraints and decision boundaries, not tutorials.
Detailed examples and implementation templates belong in `docs/`.
