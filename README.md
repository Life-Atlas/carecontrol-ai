# CareControl AI

**A Life Atlas module for elderly home care coordination.**

Puts control back in the hands of the older person and their family — no municipal system integration needed.

## The Problem

Fatimah is 84, Iranian-born, living in Sweden with hemtjänst. She sees 16 different staff in 14 days. Nobody tells her who's coming or when. She can't communicate with most of them. Her daughter Dena, living in another city, can't get the schedule and worries constantly.

*"Hon har tappat kontrollen och mår dåligt."* — Dena

## The Solution

An app where Dena enters the schedule, Fatimah sees "who's coming today" in her language, staff see her care passport at the door, and everyone can rate the experience.

No API integrations. No municipal procurement. Just a phone and a 4-digit code.

## Quick Start

```bash
# 1. Clone
git clone https://github.com/lifeatlas/carecontrol-ai.git
cd carecontrol-ai

# 2. Install
npm install

# 3. Configure
cp .env.example .env.local
# Edit .env.local with your Supabase project URL and anon key

# 4. Database
# Paste supabase/migrations/*.sql into your Supabase SQL Editor (in order)

# 5. Run
npm run dev
```

## Tech Stack

- React + TypeScript + Vite
- Tailwind CSS
- Supabase (Postgres, Auth, Edge Functions, Realtime)
- Anthropic Claude API (translation)
- Twilio (voice calls — Stage 3)

## Project Structure

```
src/
  pages/        → Login, Onboarding, TodayView, Dashboard, Schedule, Profile, StaffView
  hooks/        → useAuth (context provider)
  lib/          → supabase client, types, constants
supabase/
  migrations/   → SQL schema files
  functions/    → Edge Functions (translation, etc.)
```

## Development

See **CLAUDE_CODE_TASKS.md** for the full task queue. Each task is a self-contained prompt for Claude Code or any AI coding agent.

## Stages

1. **Core** (Weeks 1-2): Schedule + Today View + Staff View
2. **Translation + Ratings** (Weeks 3-4): Real-time translation + rating system
3. **Viral + Agent** (Weeks 5-8): Invite flow + AI morning calls
4. **Revenue** (Weeks 9-16): Premium subscriptions + provider dashboards

## License

Proprietary — Life Atlas AB © 2026
