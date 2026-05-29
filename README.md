# CareControl AI

**AI-driven care coordination for Swedish hemtjänst (home care).**

Puts control back in the hands of the older person and their family — no municipal system integration needed.

**[Live Demo](https://life-atlas.github.io/carecontrol-ai/)** · [User Stories (51)](https://life-atlas.github.io/carecontrol-ai/docs/user-stories.html) · [Source Documents (OneDrive)](https://winniioio-my.sharepoint.com/:f:/g/personal/ceo_winniio_io/IgC3DhhVVtC4R6RaAX6M1Uv4ARVmDyzTxkzgzMeUeack6Gs)

## The Problem

Fatimah is 84, Iranian-born, living in Sweden with hemtjänst. She sees 16 different staff in 14 days. Nobody tells her who's coming or when. She can't communicate with most of them. Her daughter Dena, living in another city, can't get the schedule and worries constantly.

*"Hon har tappat kontrollen och mår dåligt."* — Dena

## The Solution

An app where Dena enters the schedule, Fatimah sees "who's coming today" in her language, staff see her care passport at the door, and everyone can rate the experience.

No API integrations. No municipal procurement. Just a phone and a 4-digit code.

## Current Build (v2 — May 2026)

| View | What's There |
|------|-------------|
| **Fatimah (TodayView)** | Full Persian UI, time-aware greeting, TTS (reads schedule aloud), staff avatars, 4 wish buttons, Hjälp button |
| **Dena (Dashboard)** | Today's schedule, mood strip, continuity card, tomorrow preview, kontaktperson card, week view |
| **Profile** | Editable care passport, emergency card (Nödinfo), language selector (10 languages), medications/allergies |
| **Staff** | 4-digit code entry, full brukare profile, task checklist, mood rating, notes |

**Demo mode** — runs entirely without a backend. Auto-detected when no Supabase is configured.

## Quick Start

```bash
git clone https://github.com/Life-Atlas/carecontrol-ai.git
cd carecontrol-ai
npm install
npm run dev
```

No `.env` needed — demo mode activates automatically with rich mock data.

## Tech Stack

- React 19 + TypeScript + Vite 6
- Tailwind CSS 3
- Supabase (Postgres, Auth, RLS, Realtime) — when connected
- Web Speech API (TTS, no backend needed)
- GitHub Pages deploy (`npm run deploy`)

## Project Structure

```
src/
  pages/        → TodayView, Dashboard, Profile, StaffView, Login, Schedule
  hooks/        → useAuth (context provider)
  lib/          → supabase client, types, mock-data, translations (i18n + TTS)
docs/
  user-stories.html  → 51 stories from 4 source documents
  sessions/          → development session logs
```

## User Stories

51 stories across 12 epics, extracted from:
1. Nicolas & Dena transcript (27 May 2026)
2. Dena's structured report
3. Market landscape strategy
4. Sahlgrenska hackathon pitch deck

Status: **12 BUILT** · 8 PARTIAL · 19 MISSING · 12 FUTURE

[View all stories →](https://life-atlas.github.io/carecontrol-ai/docs/user-stories.html)

## Regulatory Context

- **språkkrav** (Gers B2) effective July 1, 2026
- **personalkontinuitetsmått** due Oct 2027
- Public ratings at utförare level only, ≥7 respondent threshold (GDPR/IMY)
- Zero-integration architecture: AI agent calls kontaktperson directly

## License

Proprietary — Life Atlas AB © 2026
