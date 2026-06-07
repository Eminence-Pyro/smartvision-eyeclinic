# SmartVision — Digital Clinic Management System

> A purpose-built, fully digital ophthalmology clinic platform for **Anya Specialist Eye Clinic**, built with Next.js 14, Neon PostgreSQL, and NextAuth.

---

## What is SmartVision?

SmartVision is a full-stack web application that digitises every paper-based workflow in a specialist eye clinic — from patient registration at the front desk to post-operative theatre records. It includes a public-facing website with a Zinny AI chatbot, a patient self-service portal, and dedicated dashboards for each department.

### Design Philosophy
- **Role-gated access** — each staff member sees only what their job requires
- **Linear patient flow** — digital tally system tracks a patient from registration to discharge
- **Zero paper** — every record lives in the database, retrievable instantly
- **Mobile-first** — all screens work on phones (clinic staff typically use tablets/phones)

---

## Tech Stack & Why

| Layer | Technology | Reason |
|---|---|---|
| Framework | **Next.js 14 (App Router)** | Server components, API routes, file-based routing, edge-ready |
| Language | **TypeScript** | Type safety across frontend and backend |
| Database | **Neon PostgreSQL** | Serverless Postgres with free tier; no 30-day expiry like Render |
| Auth | **NextAuth v4** | Supports credentials (email+password, OTP) and Google OAuth; JWT sessions |
| Styling | **Tailwind CSS** | Utility-first; consistent design system with custom purple brand tokens |
| AI Chatbot | **Groq / Llama 3.3 70B** | Fastest inference available; free tier; clinic-context tuning via system prompt |
| File uploads | **Cloudinary** | Scan and B-scan images; free 25GB; direct upload from browser |
| Icons | **Lucide React** | Consistent, tree-shakeable icon set |
| Passwords | **bcryptjs** | Industry standard password hashing (12 rounds) |
| Forms | **React Hook Form + Zod** | Client validation + server schema parsing |
| DB connection | **@neondatabase/serverless** | Edge-compatible Neon client; no connection pooling setup needed |

---

## Features — Implemented

### Public Website
- Multi-page: Home, About, Services, Blog, Contact
- Hero carousel (3 slides, 9s auto-advance, smooth cross-fade)
- Patient testimonials (10s auto-rotate with fade)
- Stats bar, services grid, blog preview, CTA banner
- Zinny AI floating chatbot on every page
- Fully responsive — all screen sizes

### Patient Portal (`/portal/`)
- Self-registration with email + password
- Login: password, OTP (email), or Google Sign-In
- Medical history: all visits, diagnoses, prescriptions, scans
- Appointment booking (with telemedicine option)
- Medication tracker
- Zinny AI assistant

### Staff Portal (`/staff/`)

| Department | Route | Role |
|---|---|---|
| Front Desk | `/staff/front-desk` | `front_desk`, `admin` |
| VA Room | `/staff/va-room` | `va_room`, `admin` |
| Accounts | `/staff/accounts` | `accounts`, `admin` |
| Doctor | `/staff/doctor` | `doctor`, `admin` |
| Scan Room | `/staff/scan-room` | `scan_room`, `admin` |
| Theatre | `/staff/theatre` | `theatre`, `admin` |
| Pharmacy | `/staff/pharmacy` | `pharmacy`, `admin` |
| Admin | `/staff/admin` | `admin` only |
| Analytics | `/staff/admin/analytics` | `admin` only |

#### Front Desk
- Search patients by name / phone / patient number
- Register new patients (full demographics, HMO, NOK, allergies)
- Auto-generate patient numbers (ASE/YEAR/XXXX) and daily tally numbers
- Record vitals: BP, pulse, weight, height, BMI, temperature, SpO₂, blood sugar
- Express service flag
- Live queue management (call, skip, done)

#### VA Room
- Structured VA entry: unaided, aided, pinhole — both eyes
- IOP with method (NCT, Goldmann, iCare)
- Colour vision, cover test, motility, confrontation VF, pupils
- Auto-advances visit to `awaiting_doctor` on save

#### Accounts
- Record payment for any service type
- Methods: cash, POS, bank transfer, HMO, clinic-billed
- HMO: insurer name + authorisation code
- Auto-generated receipt numbers

#### Doctor
- Patient summary card (vitals + VA visible before consulting)
- Full SOAP clinical notes — both eyes separately
- Multi-drug prescription pad
- One-click scan booking (OCT, fundus, B-scan, gonioscopy, pachymetry, VF, topography)
- One-click surgery booking

#### Scan Room
- Booked scans listed by patient
- Image upload to Cloudinary
- Findings entry; visit returned to doctor on completion

#### Theatre
- Surgery details: anaesthesia, duration, IOL (brand, model, power, position)
- Technique notes and complications
- Post-op VA and IOP
- B-scan image upload

#### Pharmacy
- Lists all undispensed prescriptions
- One-click dispense with timestamp

#### Admin
- Create staff accounts (all 8 roles)
- Toggle active/inactive
- Full analytics dashboard (7-day trend, revenue breakdown, dept flow, top diagnoses)

---

## Features — Not Yet Implemented

| Feature | Notes |
|---|---|
| **Email (SMTP)** | Config ready in `.env.example`; send OTPs and appointment reminders |
| **Payment gateway (Paystack)** | Config ready; online fee payment before arriving |
| **Telemedicine video** | Architecture designed; needs Daily.co or Whereby integration |
| **SMS notifications** | Appointment reminders via Termii or Twilio |
| **Data import** | Bulk CSV import of existing patient records |
| **PWA / offline** | Service worker for offline access on poor networks |
| **Analytics export** | PDF/Excel monthly report download |
| **Audit log** | Full record of who changed what and when |
| **Multi-branch** | Multiple clinic locations under one account |
| **Patient photo capture** | Webcam photo at registration |
| **Referral letters** | Auto-generated PDF referral letters from doctor notes |

---

## Current Limitations & Known Issues

| Issue | Status | Notes |
|---|---|---|
| Email OTP login requires SMTP config | ⚠️ Not blocking | Works once `SMTP_*` env vars are set |
| Google OAuth requires console setup | ⚠️ Not blocking | Works once `GOOGLE_CLIENT_ID/SECRET` are set |
| No row-level security on DB queries | 🔴 Future fix | Currently relies on NextAuth session role checks only |
| No rate limiting on API routes | 🔴 Future fix | Add `upstash/ratelimit` before going to production |
| Images served from Unsplash CDN | 🟡 Cosmetic | Replace with actual clinic photography before launch |
| Blog is static/placeholder content | 🟡 Cosmetic | Connect to a CMS (Contentful, Sanity) for real articles |
| No database connection pooling | 🟡 Low risk | Neon serverless handles this; revisit at scale |
| No automated database backups config | 🟡 Low risk | Neon handles backups; set up point-in-time recovery |

---

## Security Notes (Pre-production Checklist)

- [ ] Rotate all secrets — generate new `NEXTAUTH_SECRET` for production
- [ ] Add rate limiting to `/api/auth/*` and `/api/patients/register`
- [ ] Enable Neon's IP allowlist for the production server
- [ ] Add `NEXTAUTH_URL` to exact production domain
- [ ] Review all API routes for missing `getServerSession` auth checks
- [ ] Enable Vercel's security headers (CSP, HSTS) in `next.config.js`
- [ ] Set up Sentry DSN for error monitoring

---

## Getting Started

### Prerequisites
- Node.js 18+
- A [Neon](https://neon.tech) PostgreSQL database (free tier)
- A `.env.local` file (copy from `.env.example`)

### Setup

```bash
# 1. Clone
git clone https://github.com/Eminence-Pyro/smartvision-eyeclinic.git
cd smartvision-eyeclinic

# 2. Install
npm install

# 3. Configure
cp .env.example .env.local
# Fill in DATABASE_URL, NEXTAUTH_SECRET, NEXTAUTH_URL at minimum

# 4. Create database tables
node scripts/migrate.js

# 5. Create demo accounts
node scripts/seed.js

# 6. Run
npm run dev
```

### Demo Accounts

| Role | Email | Password | Login URL |
|---|---|---|---|
| Patient | test@patient.com | Test1234! | /portal/login |
| Admin | admin@anya.com | Admin1234! | /staff/login |
| Doctor | doctor@anya.com | Doctor1234! | /staff/login |
| Front Desk | frontdesk@anya.com | Frontdesk1234! | /staff/login |
| VA Room | varoom@anya.com | Varoom1234! | /staff/login |
| Accounts | accounts@anya.com | Accounts1234! | /staff/login |
| Scan Room | scanroom@anya.com | Scanroom1234! | /staff/login |
| Theatre | theatre@anya.com | Theatre1234! | /staff/login |
| Pharmacy | pharmacy@anya.com | Pharmacy1234! | /staff/login |

---

## Patient Flow

```
Patient Arrives
  → Front Desk (register + vitals + tally)
  → Accounts (pay consultation fee)
  → VA Room (visual acuity + IOP)
  → Doctor (consultation + notes + prescriptions)
       ↓                    ↓                   ↓
  Pharmacy           Scan Room            Theatre
(dispense meds)   (scan + findings)   (surgery + IOL)
                        ↓                    ↓
                  Back to Doctor    Accounts → Theatre
```

---

## Project Structure

```
src/
  app/
    (public)/          # Public site + patient portal
      page.tsx         # Homepage
      about/           # About page
      services/        # Services page
      blog/            # Blog / knowledge centre
      contact/         # Contact form
      portal/          # Patient portal (login, register, dashboard)
      staff/login/     # Staff login (separate dark-themed page)
    (staff)/           # Staff dashboards (protected, role-gated)
      staff/
        dashboard/     # Staff home
        front-desk/    # Registration + vitals + queue
        va-room/       # Vision assessment
        accounts/      # Payments
        doctor/        # Clinical notes + prescriptions
        scan-room/     # Scan images + findings
        theatre/       # Surgery records
        pharmacy/      # Prescription dispensing
        admin/         # Staff management
        admin/analytics/ # Full analytics dashboard
    api/               # Next.js API routes (backend)
  components/
    ui/                # Shared: Navbar, Footer, Logo
    staff/             # Staff-specific: StaffLayout, PatientSearchRegister, etc.
  lib/
    auth/index.ts      # NextAuth config + helpers
    db.ts              # Neon SQL query wrapper
    types.ts           # Shared TypeScript interfaces
    utils.ts           # Formatting, constants, helpers
scripts/
  migrate.js           # Create all DB tables
  seed.js              # Create demo accounts
```

---

## Future Improvements & Recommendations

1. **Replace static blog with a headless CMS** (Sanity.io or Contentful) — allows the clinic to post eye health articles without touching code
2. **Add Paystack for online payments** — patients pay before arriving, reducing front-desk queue
3. **Implement row-level security** — use Neon's RLS policies so even a compromised API key can't expose all patient data
4. **Add Sentry error monitoring** — catch production errors before they affect patients
5. **Add automated tests** — Jest + React Testing Library for critical flows (registration, login, visit creation)
6. **Consider tRPC or React Query** — for type-safe API calls and server state caching, especially in the doctor's console
7. **Build a mobile app** — React Native (Expo) sharing the same backend for on-call doctor access
8. **Telemedicine** — integrate Daily.co for HIPAA-aligned video consultations
9. **Analytics export** — PDF monthly reports using `@react-pdf/renderer`
10. **Internationalisation** — support Yoruba, Igbo, Hausa for wider patient access

---

## Contributing

This project was built by **Divine Moses Nnata (Eminence)**.

For handover to another engineer or AI tool, the most important files to read first are:
1. `README.md` (this file)
2. `src/lib/types.ts` — all data models
3. `src/lib/auth/index.ts` — authentication logic
4. `scripts/migrate.js` — database schema
5. `src/lib/utils.ts` — constants and helpers (especially `VISIT_STATUS_*`)

The app uses **Next.js App Router** exclusively. All data fetching in staff pages is done client-side (`"use client"` + `fetch()`). There are no React Server Components fetching data yet — this is a future improvement.

---

*SmartVision Platform · Anya Specialist Eye Clinic · Built June 2026*
