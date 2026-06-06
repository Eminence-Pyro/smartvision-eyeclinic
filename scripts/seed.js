#!/usr/bin/env node
/**
 * SmartVision Demo Account Seeder
 * Run: node scripts/seed.js
 *
 * Creates test accounts:
 *   PATIENT   test@patient.com    / Test1234!
 *   ADMIN     admin@anya.com      / Admin1234!
 *   DOCTOR    doctor@anya.com     / Doctor1234!
 *   ACCOUNTS  accounts@anya.com   / Accounts1234!
 *   FRONTDESK frontdesk@anya.com  / Frontdesk1234!
 */

require("dotenv").config({ path: ".env.local" });
const { neon } = require("@neondatabase/serverless");
const bcrypt   = require("bcryptjs");

if (!process.env.DATABASE_URL) {
  console.error("\n❌  DATABASE_URL not set in .env.local\n");
  process.exit(1);
}

const sql = neon(process.env.DATABASE_URL);

async function hash(pw) {
  return bcrypt.hash(pw, 12);
}

async function seed() {
  console.log("\n🌱  Starting seed...\n");

  // ── 1. Ensure tables exist (safe — won't drop existing data) ──────────────
  await sql`
    CREATE TABLE IF NOT EXISTS patients (
      id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      first_name      TEXT NOT NULL,
      last_name       TEXT NOT NULL,
      email           TEXT UNIQUE NOT NULL,
      phone           TEXT,
      gender          TEXT,
      date_of_birth   DATE,
      patient_number  TEXT UNIQUE,
      password_hash   TEXT,
      email_verified  BOOLEAN DEFAULT FALSE,
      hmo_name        TEXT,
      hmo_number      TEXT,
      address         TEXT,
      occupation      TEXT,
      allergies       TEXT,
      nok_name        TEXT,
      nok_phone       TEXT,
      nok_relationship TEXT,
      created_at      TIMESTAMPTZ DEFAULT NOW(),
      updated_at      TIMESTAMPTZ DEFAULT NOW()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS staff (
      id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      first_name    TEXT NOT NULL,
      last_name     TEXT NOT NULL,
      email         TEXT UNIQUE NOT NULL,
      phone         TEXT,
      role          TEXT NOT NULL CHECK (role IN (
                      'admin','doctor','front_desk','va_room',
                      'accounts','scan_room','theatre','pharmacy'
                    )),
      department    TEXT,
      password_hash TEXT NOT NULL,
      is_active     BOOLEAN DEFAULT TRUE,
      created_at    TIMESTAMPTZ DEFAULT NOW(),
      updated_at    TIMESTAMPTZ DEFAULT NOW()
    )
  `;

  console.log("✅  Tables verified\n");

  // ── 2. Upsert patient ─────────────────────────────────────────────────────
  const patientHash = await hash("Test1234!");
  await sql`
    INSERT INTO patients
      (first_name, last_name, email, phone, gender,
       patient_number, password_hash, email_verified)
    VALUES
      ('Test','Patient','test@patient.com','+234 800 000 0001','male',
       'ASE/2026/0001', ${patientHash}, TRUE)
    ON CONFLICT (email) DO UPDATE SET
      password_hash  = EXCLUDED.password_hash,
      email_verified = TRUE,
      updated_at     = NOW()
  `;
  console.log("✅  Patient    →  test@patient.com    /  Test1234!");

  // ── 3. Staff accounts ─────────────────────────────────────────────────────
  const staffAccounts = [
    { first:"Admin",     last:"User",     email:"admin@anya.com",     phone:"+234 800 000 0002", role:"admin",      dept:"Management", pw:"Admin1234!"      },
    { first:"Dr. Anya",  last:"Okonkwo",  email:"doctor@anya.com",    phone:"+234 800 000 0003", role:"doctor",     dept:"Outpatient", pw:"Doctor1234!"     },
    { first:"Accounts",  last:"Staff",    email:"accounts@anya.com",  phone:"+234 800 000 0004", role:"accounts",   dept:"Accounts",   pw:"Accounts1234!"   },
    { first:"Front",     last:"Desk",     email:"frontdesk@anya.com", phone:"+234 800 000 0005", role:"front_desk", dept:"Front Desk", pw:"Frontdesk1234!"  },
  ];

  for (const s of staffAccounts) {
    const h = await hash(s.pw);
    await sql`
      INSERT INTO staff
        (first_name, last_name, email, phone, role, department, password_hash, is_active)
      VALUES
        (${s.first}, ${s.last}, ${s.email}, ${s.phone}, ${s.role}, ${s.dept}, ${h}, TRUE)
      ON CONFLICT (email) DO UPDATE SET
        password_hash = EXCLUDED.password_hash,
        is_active     = TRUE,
        updated_at    = NOW()
    `;
    const label = s.role.padEnd(10);
    console.log(`✅  ${label}  →  ${s.email.padEnd(26)}  /  ${s.pw}`);
  }

  console.log("\n🎉  All demo accounts ready!\n");
  console.log("   Patient portal :  http://localhost:3000/portal/login");
  console.log("   Staff portal   :  http://localhost:3000/staff/login\n");
}

seed().catch(err => {
  console.error("\n❌  Seed failed:", err.message, "\n");
  process.exit(1);
});
