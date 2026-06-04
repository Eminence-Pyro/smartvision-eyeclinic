# 🏥 SmartVision — Anya Specialist Eye Clinic

> **Full-stack clinic management system** — patient portal, staff workflow, AI chatbot (Zinny), telemedicine
> Next.js 14 · Neon PostgreSQL · NextAuth · Cloudinary · Groq AI

🔗 **Repo:** `github.com/Eminence-Pyro/smartvision-eyeclinic`
🚀 **Status:** Phase 1 & 2 complete — auth, DB schema, public website, patient portal, staff workflow

---

## 🗺️ System Overview

### User Roles
| Role | Access |
|---|---|
| Admin | Full access + staff management |
| Doctor | Patient records, clinical notes, prescriptions, scans, surgeries |
| Front Desk | Register patients, vitals, queue |
| VA Room | Visual acuity + IOP entry |
| Accounts | Payment recording (cash/POS/transfer/HMO) |
| Scan Room | Upload OCT/scan results |
| Theatre | Surgery parameters, B-scan, pre-op |
| Pharmacy | View + dispense prescriptions |
| Patient | Own records, appointments, telemedicine |

### Patient Flow
```
Arrive → Front Desk (register + vitals + tally)
       → Accounts (consultation fee)
       → VA Room (visual acuity + IOP)
       → Doctor (diagnosis + prescription/scan/surgery booking)
       → [Pharmacy | Scan Room → Doctor | Theatre → Accounts → Theatre]
```

---

## ⚡ Quick Start

```bash
git clone https://github.com/Eminence-Pyro/smartvision-eyeclinic.git
cd smartvision-eyeclinic
npm install
cp .env.example .env.local
# Fill in all env vars (see below)
npm run dev
```

---

## 🗄️ Database Setup (Neon PostgreSQL)

1. Create a free database at [neon.tech](https://neon.tech)
2. Copy the connection string to `DATABASE_URL` in `.env.local`
3. Run the schema:

```bash
# Option A: paste schema.sql into Neon SQL editor
# Option B: run migration script
node scripts/migrate.js
```

Schema file: `src/lib/db/schema.sql`

---

## 🔑 Environment Variables

```env
# Database
DATABASE_URL=postgresql://...

# Auth
NEXTAUTH_SECRET=...          # openssl rand -base64 32
NEXTAUTH_URL=http://localhost:3000

# Email (OTP + notifications)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM="Anya Eye Clinic <noreply@...>"

# Cloudinary (scan image uploads)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...

# Paystack (activate when clinic has account)
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=...
PAYSTACK_SECRET_KEY=...

# Groq (Zinny AI chatbot)
GROQ_API_KEY=...

# Daily.co (telemedicine video)
DAILY_API_KEY=...
```

---

## 🏗️ Architecture

```
src/
├── app/
│   ├── (public)/                 ← Public website + patient portal
│   │   ├── page.tsx              ← Landing page + Zinny chatbot
│   │   ├── portal/
│   │   │   ├── login/            ← Patient login (password + OTP)
│   │   │   ├── register/         ← Self-registration
│   │   │   └── dashboard/        ← Patient dashboard (appointments, history)
│   │   └── staff/login/          ← Staff login (dark theme)
│   ├── (staff)/staff/            ← All staff pages (role-protected)
│   │   ├── dashboard/            ← Role-aware dashboard
│   │   ├── front-desk/           ← Register + vitals + queue
│   │   ├── va-room/              ← Visual acuity + IOP
│   │   ├── accounts/             ← Payments
│   │   ├── doctor/               ← Clinical notes + prescriptions
│   │   ├── scan-room/            ← Scan upload
│   │   ├── theatre/              ← Surgery parameters
│   │   ├── pharmacy/             ← Dispensing
│   │   └── admin/                ← Staff management + reports
│   └── api/                      ← All API routes
│       ├── auth/                 ← NextAuth + OTP
│       ├── patients/             ← Register + search
│       ├── visits/               ← Create + list
│       ├── vitals/               ← Record vitals
│       ├── vision-assessment/    ← VA + IOP
│       ├── payments/             ← Record payments
│       ├── clinical-notes/       ← Doctor notes
│       ├── prescriptions/        ← Medications
│       ├── scans/                ← Scan results
│       ├── surgeries/            ← Surgery records
│       └── ai/chat/              ← Zinny AI (Groq)
├── components/
│   ├── staff/                    ← Staff-specific components
│   ├── patient/                  ← Patient portal components
│   ├── ui/                       ← Shared UI primitives
│   └── providers/                ← SessionProvider
└── lib/
    ├── db/                       ← Neon client + schema.sql
    ├── auth/                     ← NextAuth config + helpers
    ├── types/                    ← All TypeScript types
    └── utils.ts                  ← Shared utilities
```

---

## 🗺️ Development Roadmap

### ✅ Phase 1 — Foundation (Done)
- [x] Project setup (Next.js 14, Neon, NextAuth)
- [x] Complete database schema (14 tables)
- [x] All TypeScript types
- [x] Auth — staff + patient, JWT, OTP
- [x] Role permission matrix

### ✅ Phase 2 — Public Website (Done)
- [x] Landing page (hero, services, about Dr. Anya, contact)
- [x] Patient login (password + OTP toggle)
- [x] Patient self-registration
- [x] Staff login (dark theme)
- [x] Zinny chatbot UI

### 🔄 Phase 3 — Staff Workflow (In Progress)
- [x] Front Desk — register + vitals + queue
- [ ] VA Room — VA + IOP form
- [ ] Accounts — payment recording
- [ ] Doctor — clinical notes, prescriptions, scan/surgery booking
- [ ] Scan Room — upload scan results (Cloudinary)
- [ ] Theatre — surgery parameters, B-scan
- [ ] Pharmacy — dispensing

### 📋 Phase 4 — Patient Portal + AI
- [ ] Patient dashboard (visit history, medications, appointments)
- [ ] Online appointment booking + Paystack payment
- [ ] Zinny AI (Groq-powered clinic chatbot)
- [ ] Telemedicine text chat
- [ ] Telemedicine video call (Daily.co)

### 📋 Phase 5 — Admin + Reports
- [ ] Admin staff management (create, assign roles, activate/deactivate)
- [ ] Analytics dashboard (daily patients, revenue, surgery stats)
- [ ] Data import from old system
- [ ] Mobile-optimised views

---

## 🔐 Security Notes

- Staff accounts are created by Admin only (CMD controls access)
- JWT sessions expire in 24 hours
- OTPs expire in 10 minutes
- All API routes protected by `getServerSession`
- Patient numbers auto-generated: `ASE/YYYY/NNNN`
- Passwords: bcrypt with cost factor 12

---

*Built by Divine Moses Nnata (Eminence) for Anya Specialist Eye Clinic*
*SmartVision — Because every patient deserves world-class eye care.*
