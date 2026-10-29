# Prompt for Antigravity

You are working in this repository. **Interview Booking (`frontend/` and `backend/` at the repository root) is the main project and must remain the primary application.** The complete source code for SmartRoute is in `integrations/smartroute/`, and TrainDesk is in `integrations/traindesk/`.

Your task is to integrate the capabilities of all three projects into one cohesive application, using Interview Booking as the foundation. Do not merely redesign the UI or create mock pages: inspect and reuse the existing implementations.

## Required workflow
1. Read the root README/package files and inspect all three codebases, including routes, controllers, models, authentication, environment variables and frontend navigation.
2. Make a short integration plan based on the actual code and identify conflicts before editing.
3. Preserve Interview Booking's existing booking/session functionality and its current working flows.
4. Integrate SmartRoute's placement/application workflows and AI question-generation/practice capabilities as a clearly separated module.
5. Integrate TrainDesk's training schedule, trainer/session management, attendee bookings/waitlists and scheduling conflict detection as a separate module.
6. Use one coherent frontend entry point and navigation. Reuse the root app shell and existing auth where safe; avoid duplicating login systems without a clear reason.
7. Reconcile database models and user roles carefully. Avoid model/collection collisions and route collisions. Keep each module's controllers/services organized.
8. Consolidate package scripts/dependencies and environment examples only after checking compatibility. Keep secrets out of source control.
9. Implement the integration in small steps. Do not delete source functionality just to make the build pass.
10. Run install/build/lint/tests available in the repository. Fix errors where practical and clearly list anything not verified.
11. Update documentation with setup steps, environment variables, module routes, database notes and test/build results.

## Product expectation
The final product should feel like one platform, not three unrelated projects pasted together. Interview Booking remains the home/core module. Add navigation or dashboard entry points for **Interview Booking**, **Placement & AI Practice (SmartRoute)**, and **Training Management (TrainDesk)**. Protect routes and actions by appropriate roles. Do not expose admin/host actions to ordinary users.

## Important constraints
- Do not overwrite the root Interview Booking project with either integrated project.
- Do not assume the projects' auth schemas, API paths or dependencies are compatible; verify them from source.
- Do not hardcode API keys or database credentials.
- Do not mark features complete if they are placeholders or untested.
- At the end, summarize files changed, architecture decisions, commands run, test/build outcomes and remaining issues.
