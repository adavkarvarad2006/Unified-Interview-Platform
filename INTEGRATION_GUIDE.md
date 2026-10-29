# Unified Interview Platform — Integration Guide

## Main project

`frontend/` and `backend/` at the repository root are the **Interview Booking** application and must remain the primary app. Do not replace its UI, routes, authentication, booking flow, environment variables, or existing API behavior unless needed for a clearly documented integration.

## Included source projects

- `integrations/smartroute/` — SmartRoute source project (frontend, backend, package/workspace files and configuration retained).
- `integrations/traindesk/` — TrainDesk source project (frontend/backend and configuration retained).

The two projects are included as source modules for integration work; they have not been force-merged into the primary runtime because their data models, routes, dependencies and auth flows may conflict. Use the included source as reference and integrate deliberately.

## Suggested unified product direction

Build one platform with Interview Booking as the main experience and add these modules behind the existing app shell/navigation:

1. **Interview Booking (core):** preserve existing appointment/session booking, availability, counsellor/admin functions and authentication.
2. **SmartRoute (placement & AI practice):** placement listings, applications, candidate/host workflows and AI-generated interview/quiz practice.
3. **TrainDesk (training operations):** trainer schedules, training sessions, booking capacity, attendee lists, waitlists and schedule conflict checks.

## Integration rules for the coding agent

- First inspect the existing root app and all three projects before changing files.
- Keep the root Interview Booking app as the single entry point and source of truth for the main navigation.
- Reuse the existing root frontend/backend where practical; do not start three independent apps unless required and explicitly explained.
- Avoid blindly copying files over each other. Resolve route, model, controller, component, environment-variable and dependency conflicts intentionally.
- Keep modules logically separated (for example `placement`, `training`, and `interview-booking`) while sharing authentication only after reviewing the current user/role models.
- Preserve existing features. Add navigation links and module pages incrementally.
- Consolidate dependencies and scripts only after checking compatibility. Do not commit secrets; use `.env.example` files.
- Update root README with final setup/run instructions, routes, environment variables and migration notes.
- Run available lint/build/tests and report what passes and what remains incomplete. Do not claim an integration is working without running it.

## Current state

This archive combines all three complete source trees in one repository, with Interview Booking at the root and the other two projects under `integrations/`. It is a safe starting point for Antigravity to perform the actual code-level integration; it is not represented as a finished, tested single-runtime merge.
