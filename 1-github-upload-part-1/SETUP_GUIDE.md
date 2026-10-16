# WildTrek - Setup & Deployment Guide

## WildTrek 1.0 — what works with zero setup

`npm install && npm run dev` gives you the full app with **no API keys and no database**:

| Page | What it does |
|---|---|
| `/` | Home: live conditions, open seasons, top guides, prime species, spots |
| `/fishing`, `/hunting` | Activity hubs |
| `/guides`, `/guides/[id]` | Searchable/filterable directory, full profiles, trip packages, reviews, booking flow |
| `/conditions` | Live weather (Open-Meteo), water temp & waves, NOAA tides chart, solunar table, bite score |
| `/species`, `/species/[slug]` | Field guide: 25 fish & game species with ID, habitat, techniques, best months, TPWD limits |
| `/locations`, `/locations/[slug]` | 14 spots with access, hazards, tips, live conditions, nearby guides |
| `/regulations` | 2026–27 hunting season timeline + fishing bag/length limits (from TPWD) |
| `/logbook` | Catch & harvest log with personal bests, moon phase, CSV export |
| `/gear` | Tap-to-pack checklists |
| `/cave`, `/vibes`, `/how-it-works`, `/dashboard` | Articles, community feed, FAQ, trips dashboard |

Content lives in `data/` (guides, species, seasons, locations, articles, gear). New UI lives in
`components/`, helpers in `lib/`. Bookings, logbook, gear checks and posts are saved in the
browser (localStorage) until Supabase accounts are wired up. Superseded 0.x components were
moved to `_legacy/` (excluded from the build), not deleted.

**Before launch:** the guide listings in `data/guides.ts` are sample profiles. Replace them with
real, approved guides. Re-check `data/seasons.ts` and the `regulation` fields in
`data/species.ts` against TPWD every Sept 1 when the license year rolls over.

## Quick Start

### 1. Prerequisites
- Node.js 18+ (use `nvm use 18` or higher)
- pnpm (`npm install -g pnpm`)
- Supabase account (free tier works)

### 2. Install Dependencies
```bash
pnpm install
```

### 3. Set Up Environment Variables
```bash
cp .env.example .env.local
```
Edit `.env.local` and fill in at minimum:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`  
- `SUPABASE_SERVICE_ROLE_KEY`

### 4. Set Up Database
1. Go to your Supabase project → SQL Editor
2. Run `database-schema.sql` (creates all tables)
3. Run `supabase-seed-data.sql` (optional: adds sample guides)

### 5. Run Locally
```bash
pnpm dev
```
Open http://localhost:3000

---

## Vercel Deployment

### One-Click Deploy
1. Push this folder to a GitHub repo
2. Import to Vercel: https://vercel.com/new
3. Add environment variables in Vercel dashboard
4. Deploy!

### Environment Variables on Vercel
Go to: Project → Settings → Environment Variables

**Required:**
| Variable | Where to get |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Project Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Project Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Project Settings → API |

**Optional (add as needed):**
| Variable | Feature |
|---|---|
| `STRIPE_SECRET_KEY` | Real payments |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Real payments |
| `RESEND_API_KEY` | Email notifications |
| `TWILIO_ACCOUNT_SID` + `TWILIO_AUTH_TOKEN` + `TWILIO_PHONE_NUMBER` | SMS alerts |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | Interactive maps |
| `NEXT_PUBLIC_OPENWEATHER_API_KEY` | Live weather |
| `OPENAI_API_KEY` | AI fishing assistant |

---

## Database Schema

Run the SQL files in this order in Supabase SQL Editor:
1. `database-schema.sql` — Core tables (users, guides, bookings, reviews, articles)
2. `supabase-setup.sql` — Row Level Security (RLS) policies
3. `supabase-functions.sql` — Database functions and triggers
4. `supabase-seed-data.sql` — Sample data (optional)

---

## Project Structure

```
wildtrek/
├── app/                    # Next.js 15 App Router pages
│   ├── layout.tsx          # Root layout with AuthProvider + ThemeProvider
│   ├── page.tsx            # Home page
│   ├── guides/             # Browse guides
│   ├── auth/               # Login / Register
│   ├── dashboard/          # Customer dashboard
│   ├── cave/               # The Cave (articles & content)
│   ├── vibes/              # Community feed
│   ├── admin/              # Admin panel
│   └── api/                # API routes
│       ├── bookings/       # Booking CRUD
│       ├── guides/         # Guide CRUD + search
│       ├── reviews/        # Review CRUD
│       ├── weather/        # Weather proxy
│       ├── payments/       # Stripe integration
│       ├── articles/       # Cave content
│       ├── auth/           # Auth callbacks
│       └── ai/             # AI guide helper
├── *.tsx                   # All components (flat structure)
├── *.ts                    # All utilities and services
├── package.json
├── next.config.mjs
├── tailwind.config.ts
└── tsconfig.json
```

**Note:** All source files are in the root directory (flat structure).
The TypeScript path alias `@/*` maps to `./`, so imports like
`import { Button } from "@/button"` resolve correctly.

---

## Features

- **Guide Discovery**: Search and filter guides by location, specialty, price, rating
- **Booking System**: Full booking flow with availability calendar and payment
- **User Authentication**: Supabase Auth with email/password
- **Weather Integration**: Real-time fishing conditions via OpenWeather API
- **The Cave**: Community articles and fishing tips
- **Vibes Feed**: Social feed for sharing catches and stories
- **AI Helper**: Fishing assistant powered by OpenAI
- **Admin Panel**: Guide approval and platform management
- **Verification System**: Guide license scanning and verification
- **Interactive Map**: Texas Gulf Coast fishing locations
- **Reviews**: Verified post-trip review system

---

## Troubleshooting

**Build fails on Vercel?**
- Check all required env vars are set
- Ensure `NEXT_PUBLIC_SUPABASE_URL` starts with `https://`
- The app gracefully handles missing optional API keys

**Supabase connection errors?**
- Verify your project URL and keys in Supabase dashboard
- Check that RLS policies are set up (run `supabase-setup.sql`)

**Payments not working?**
- Without Stripe keys, the app uses "mock payment" mode
- To enable real payments, add both `STRIPE_SECRET_KEY` and `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15.2.8 (App Router) |
| Language | TypeScript |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth |
| Styling | Tailwind CSS |
| UI Components | shadcn/ui (Radix UI) |
| Payments | Stripe |
| Email | Resend |
| SMS | Twilio |
| Maps | Google Maps |
| Weather | OpenWeather |
| Deployment | Vercel |
