# Unified Interview Platform

This repository contains three source projects in one workspace.

- **Primary application:** Interview Booking — root `frontend/` and `backend/`
- **Integrated source module:** SmartRoute — `integrations/smartroute/`
- **Integrated source module:** TrainDesk — `integrations/traindesk/`

Start with `INTEGRATION_GUIDE.md`. To ask Antigravity to do the code-level integration, provide it with `ANTIGRAVITY_PROMPT.md` and the repository folder.

The archive preserves each project's source separately to avoid accidental overwrites. A single-runtime integration still needs to be performed and tested.

## Gemini quiz questions

The booked-interview quiz requests a fresh adaptive question bank from Gemini when `GEMINI_API_KEY` is configured. For Docker Compose, copy the root `.env.example` to `.env`, set your Google AI Studio key, and rebuild the app with `docker compose up --build`. Keep `.env` private. Without a key, the app uses its offline question bank.
