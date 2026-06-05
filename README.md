# 🏥 SmartVision — Anya Specialist Eye Clinic

> **Full-stack clinic management system**
> Next.js 14 · Neon PostgreSQL · NextAuth · Groq AI (Zinny) · Cloudinary · Paystack-ready

🔗 **Repo:** `github.com/Eminence-Pyro/smartvision-eyeclinic`

---

## ⚡ Quick Start (Local / Codespace)

```bash
# 1. Clone
git clone https://github.com/Eminence-Pyro/smartvision-eyeclinic.git
cd smartvision-eyeclinic

# 2. Install dependencies
npm install

# 3. Set up environment
cp .env.example .env.local
# ↑ Fill in all values (see Environment Variables section below)

# 4. Set up database (run once)
node scripts/migrate.js

# 5. Run dev server
npm run dev
# → http://localhost:3000
```

---

## 🗝️ Environment Variables (.env.local)

```env
# ── Database (Neon PostgreSQL — free at neon.tech) ──
DATABASE_URL=postgresql://user:pass@ep-xxx.us-east-2.aws.neon.tech/smartvision?sslmode=require

# ── Auth ──
NEXTAUTH_SECRET=run-this: openssl rand -base64 32
NEXTAUTH_URL=http://localhost:3000

# ── Email (for OTP) — use Gmail App Password ──
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your@gmail.com
SMTP_PASS=your-16-char-app-password
SMTP_FROM="Anya Eye Clinic <noreply@anyaeyeclinic.com>"

# ── Cloudinary (scan image uploads) ──
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# ── Groq AI — Zinny chatbot (free at console.groq.com) ──
GROQ_API_KEY=gsk_xxxxxxxxxxxx

# ── Paystack (add when clinic is ready) ──
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_live_xxxx
PAYSTACK_SECRET_KEY=sk_live_xxxx

# ── App ──
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 🗺️ Pages & Routes

### Public (no login needed)
| Route | Description |
|---|---|
| `/` | Landing page — about, services, contact, Zinny chatbot |
| `/portal/login` | Patient login (password or OTP) |
| `/portal/register` | Patient self-registration |
| `/staff/login` | Staff login |

### Patient Portal (login required)
| Route | Description |
|---|---|
| `/portal/dashboard` | Overview — visits, appointments, medications |
| `/portal/appointments` | Book & view appointments |
| `/portal/records` | Full medical records per visit |
| `/portal/medications` | All prescriptions — active & dispensed |
| `/portal/chat` | Chat with Zinny AI + book telemedicine |

### Staff Portal (role-restricted)
| Route | Roles |
|---|---|
| `/staff/dashboard` | All staff |
| `/staff/front-desk` | Admin, Front Desk |
| `/staff/va-room` | Admin, VA Room |
| `/staff/accounts` | Admin, Accounts |
| `/staff/doctor` | Admin, Doctor |
| `/staff/scan-room` | Admin, Scan Room |
| `/staff/theatre` | Admin, Theatre |
| `/staff/pharmacy` | Admin, Pharmacy |
| `/staff/admin` | Admin only |

---

## 🔄 Patient Flow

```
Arrive → Front Desk (register + vitals + tally number)
       → Accounts (pay consultation fee — cash/POS/transfer/HMO)
       → VA Room (visual acuity + IOP)
       → Doctor (clinical notes, diagnosis, prescriptions)
            ↓           ↓              ↓
       Pharmacy    Scan Room       Theatre
     (dispense)  (OCT/fundus  (surgery params,
                  upload)      B-scan, lens)
                     ↓              ↓
               Back to Doctor   Accounts (pay)
                                    ↓
                              Theatre (pre-op)
```

---

## 🗄️ Database Setup

1. Create free database at [neon.tech](https://neon.tech)
2. Copy connection string → `DATABASE_URL` in `.env.local`
3. Run migration: `node scripts/migrate.js`

Or paste `src/lib/db/schema.sql` directly into the Neon SQL editor.

---

## 🚀 Deploy to Vercel

```bash
npm install -g vercel
vercel --prod
```

Add all `.env.local` values in Vercel → Project Settings → Environment Variables.

---

## 🏗️ Architecture

```
src/
├── app/
│   ├── (public)/          ← Landing + patient portal
│   │   ├── page.tsx       ← Landing page + Zinny button
│   │   ├── portal/
│   │   │   ├── login/     ← Email+password or OTP
│   │   │   ├── register/
│   │   │   ├── dashboard/ ← Patient overview
│   │   │   ├── appointments/
│   │   │   ├── records/   ← Full medical history
│   │   │   ├── medications/
│   │   │   └── chat/      ← Zinny AI + telemedicine
│   │   └── staff/login/
│   ├── (staff)/staff/     ← All staff pages
│   │   ├── dashboard/     ← Role-aware dashboard
│   │   ├── front-desk/    ← Register + vitals + queue
│   │   ├── va-room/       ← VA + IOP form
│   │   ├── accounts/      ← Payment recording
│   │   ├── doctor/        ← Notes, Rx, scan/surgery booking
│   │   ├── scan-room/     ← Scan upload (Cloudinary)
│   │   ├── theatre/       ← Surgery params, B-scan
│   │   ├── pharmacy/      ← Dispense medications
│   │   └── admin/         ← Staff management
│   └── api/               ← All API routes (protected)
├── components/
│   ├── ui/                ← Badge, Button, Card, Input…
│   ├── staff/             ← StaffLayout, VitalsForm, QueuePanel…
│   └── providers/
└── lib/
    ├── db/                ← Neon client + schema.sql
    ├── auth/              ← NextAuth + OTP + patient number gen
    ├── types/             ← All TypeScript types
    └── utils.ts
```

---

## 📋 Roadmap

- [x] Phase 1 — Foundation (DB schema, auth, types)
- [x] Phase 2 — Public website + patient portal auth
- [x] Phase 3 — All 7 staff department screens
- [x] Phase 4 — Patient portal (dashboard, records, Zinny AI, appointments, medications)
- [ ] Phase 5 — Paystack online payments, telemedicine video (Daily.co), admin reports
- [ ] Phase 6 — Data import from old system, mobile PWA, Nigerian language support

---

*Built for Anya Specialist Eye Clinic by Divine Moses Nnata (Eminence)*
