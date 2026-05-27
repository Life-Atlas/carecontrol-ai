# CareControl AI — Agent Task Queue

> Each task below is a self-contained prompt you can paste into Claude Code.
> Work top-to-bottom. Each task assumes the previous ones are done.
> Mark ✅ when complete. Assign initials if working in a team.

---

## 🟢 STAGE 1 — Core (Ship in 2 weeks)

### TASK 1.0: Environment Setup
```
Assigned to: ___
Status: [ ]

In the carecontrol-ai project directory:
1. Run: npm install
2. Create a Supabase project at supabase.com (EU Stockholm region)
3. Copy .env.example to .env.local and fill in VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
4. Run the SQL migrations in supabase/migrations/ against your Supabase project
   (paste each .sql file into the Supabase SQL Editor, in order)
5. Enable email auth in Supabase Dashboard → Authentication → Providers → Email
6. Run: npm run dev — confirm the app loads on localhost:5173
7. Deploy to Vercel: npx vercel (follow prompts, set env vars)
```

### TASK 1.1: Fix Auth Flow
```
Assigned to: ___
Status: [ ]

Test the full auth flow:
1. Go to / → should see Login page
2. Enter an email → should get magic link email from Supabase
3. Click link → should redirect back to app → should go to /onboarding
4. Complete onboarding as anhörig → should create profiles + schedules
5. Go to /dashboard → should see the brukare's schedule

Fix any issues. Common problems:
- Supabase email templates need the redirect URL set
- RLS policies might block inserts — check Supabase logs
- The "linked_brukare_id" flow needs the anhörig profile to reference the brukare
```

### TASK 1.2: Fix Onboarding Data Flow
```
Assigned to: ___
Status: [ ]

The onboarding currently creates two profiles with the same user_id (hack for MVP).
This works but is fragile. Verify:
1. After onboarding, the profiles table has two rows: one brukare, one anhörig
2. The anhörig row has linked_brukare_id pointing to the brukare row
3. The schedules table has entries linked to the brukare's profile id
4. The Dashboard correctly fetches schedules via linked_brukare_id

If the unique constraint on user_id blocks this, change the migration:
- Remove the UNIQUE constraint on profiles.user_id
- Add a unique constraint on (user_id, role) instead
- Update the auth hook to fetch the profile matching the current role
```

### TASK 1.3: Test Today View on Mobile/Tablet
```
Assigned to: ___
Status: [ ]

Open /today on:
- Chrome mobile (use DevTools device emulation for iPad, iPhone)
- A real phone if available
- Any tablet if available

Check:
- Text is readable at arm's length (≥28px body text)
- Buttons are tappable (min 56px height)
- No horizontal scroll
- Dark background renders correctly
- Realtime updates work (change a schedule in Supabase Dashboard → Today View updates)
- Persian greeting shows correctly for fa language users (RTL text direction)

Fix any CSS/layout issues.
```

### TASK 1.4: Test Staff View End-to-End
```
Assigned to: ___
Status: [ ]

1. Note the access_code from a brukare profile (check Supabase Dashboard → profiles table)
2. Open /staff in a new incognito window
3. Enter the 4-digit code → should show brukare profile
4. Verify: name, birthplace, languages, medications, allergies, life story all display
5. Check in → verify a visit row is created in the visits table
6. Complete some tasks → check out → should show rating prompt
7. Tap an emoji → verify mood_emoji saved to visits table
8. Verify the anhörig dashboard shows the visit

Fix: The staff view currently doesn't require auth (by design — staff shouldn't need accounts for v1).
But RLS will block the query. Options:
- Use a Supabase service role key in an Edge Function that handles the code lookup
- Or add a permissive RLS policy for the access_code lookup (simpler for MVP)
```

### TASK 1.5: Add Schedule Editing
```
Assigned to: ___
Status: [ ]

On the Schedule page (/schedule):
1. Tap an existing visit → should open edit form (pre-filled)
2. Change time/staff/tasks → save → should update in DB + Today View
3. Delete a visit → confirm dialog → should remove from DB
4. Add a visit with the FAB → should appear in the correct day slot
5. Test recurring: add a visit with "repeat weekly" → should create 4 entries

Currently the edit form is not built. Build it by:
- Adding an edit mode to the existing form modal
- Pre-filling from the selected schedule
- Calling supabase.from('schedules').update() on save
```

### TASK 1.6: Deploy + Share URL
```
Assigned to: ___
Status: [ ]

1. Push to GitHub: git push origin main
2. Vercel auto-deploys (or run: npx vercel --prod)
3. Set custom domain if available (carecontrol.lifeatlas.se or similar)
4. Test the deployed URL on a real phone
5. Share the URL + a test access code with Dena for feedback
```

---

## 🟡 STAGE 2 — Translation + Ratings (Weeks 3-4)

### TASK 2.1: Supabase Edge Function for Translation
```
Assigned to: ___
Status: [ ]

Create supabase/functions/translate/index.ts:
- Accepts POST { text: string, from_lang: string, to_lang: string }
- Calls Anthropic Claude API (model: claude-sonnet-4-20250514)
- System prompt: "You are a translator for Swedish elderly care (hemtjänst).
  Translate the following from {from_lang} to {to_lang}.
  Use simple, warm language appropriate for an elderly person.
  Common terms: frukost=breakfast, dusch=shower, medicin=medicine,
  hemtjänst=home care service, promenad=walk.
  Return ONLY the translation, nothing else."
- Returns { translated_text: string }
- Deploy: npx supabase functions deploy translate
- Set ANTHROPIC_API_KEY as a secret: npx supabase secrets set ANTHROPIC_API_KEY=sk-...
```

### TASK 2.2: Translation Panel in Staff View
```
Assigned to: ___
Status: [ ]

Add to /staff view below the task checklist:
- A "Translate" section with a text input and a swap button (🔄)
- Default: Swedish → [brukare's primary language]
- Type text → tap translate → calls the Edge Function → shows result below
- Save each exchange to the visit's translation_log (jsonb array)
- Style: dark card, large text for both input and output (elderly-readable)
```

### TASK 2.3: Proper Rating System
```
Assigned to: ___
Status: [ ]

Currently mood_emoji is saved on the visit. Extend:
- After checkout, show the emoji screen (already built)
- After emoji, optionally show: "Vill du betygsätta mer?" → 1-5 stars per dimension
- Save to ratings table with rater_role = 'brukare' or 'staff'
- On anhörig dashboard, add a "Betyg" section showing:
  - Mood distribution (% happy/neutral/sad this month)
  - Average stars per dimension
  - Total visits rated
```

### TASK 2.4: Weekly Anhörig Rating
```
Assigned to: ___
Status: [ ]

Add a "Rate this week" card that appears on the dashboard every Friday:
- 5 dimensions: Continuity, Information, Reliability, Mood, Responsiveness
- Each 1-5 stars
- Optional comment
- Save to ratings table with rater_role = 'anhorig'
- Dismiss after submission, don't show again until next Friday
```

### TASK 2.5: Provider Scorecard (Public Page)
```
Assigned to: ___
Status: [ ]

Create /providers page:
- No auth required (public)
- List providers with aggregate scores
- For MVP: manually add provider names to a providers table
- Calculate scores from ratings + visits data
- Show: avg rating, total visits, continuity (unique staff names / 14 days)
- Simple card layout, one card per provider
```

---

## 🔴 STAGE 3 — Viral + Agent (Weeks 5-8)

### TASK 3.1: Invite Flow (SMS)
```
Assigned to: ___
Status: [ ]

Build the invite flow:
- Anhörig taps "Invite" → enters name + phone + role
- Creates a circles row with invite_token
- Sends SMS via Twilio (Supabase Edge Function) with link: /invite/{token}
- /invite/{token} page: shows brukare name + "Join the care circle"
- Recipient signs up → profile created → linked to brukare via circles table
- Setup: Create Twilio account, get a Swedish phone number
```

### TASK 3.2: iCal Import
```
Assigned to: ___
Status: [ ]

On /schedule, add "Import" button:
- File picker for .ics files
- Parse with ical.js library (npm install ical.js)
- Map VEVENT → schedule entry (date, time, summary → staff name, description → tasks)
- Show preview of parsed entries → confirm before saving
- Also support webcal:// URL subscription (save URL, re-fetch every 6 hours via Edge Function)
```

### TASK 3.3: AI Morning Call (Basic TTS)
```
Assigned to: ___
Status: [ ]

Supabase Edge Function triggered by pg_cron (daily at 07:00 CET):
- For each brukare with morning_call_enabled = true:
- Get today's schedules
- Generate text: "God morgon [name]. Idag klockan [time] kommer [staff] som hjälper dig med [tasks]."
- Translate to brukare's primary_language via the translate function
- Call Twilio Programmable Voice → TTS reads the message
- Log the call in an agent_calls table
```

---

## ⚪ STAGE 4 — Revenue (Weeks 9-16)

### TASK 4.1: Stripe Premium Subscription
### TASK 4.2: Provider Dashboard (B2B login)
### TASK 4.3: Emergency View (ambulance-accessible profile)
### TASK 4.4: Weekly Email Digest (Resend + Edge Function)
### TASK 4.5: Predictive Insights (Claude analysis of rating trends)
### TASK 4.6: Verksamhetssystem API Integration (Lifecare, Combine)

---

## Notes for Agents

- **Always test on mobile.** The primary user (Fatimah) uses a phone or tablet, not a laptop.
- **Supabase logs are your friend.** Auth errors and RLS blocks show up in the Supabase Dashboard → Logs.
- **Don't break the schema.** If you need a new column, create a new migration file. Don't edit existing ones.
- **Commit often.** One commit per task. Use conventional commits: `feat:`, `fix:`, `chore:`.
- **Ask before adding dependencies.** Keep the bundle small. Every KB matters on mobile.
