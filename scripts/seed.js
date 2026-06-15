#!/usr/bin/env node
// ── Load env FIRST before any other imports that use env vars ──
import { config } from "dotenv";
config({ path: ".env.local" });

import { neon } from "@neondatabase/serverless";
import bcrypt from "bcryptjs";

if (!process.env.DATABASE_URL) {
  console.error("\n❌  DATABASE_URL not set in .env.local\n");
  console.error("    Copy .env.example to .env.local and fill in your Neon connection string.\n");
  process.exit(1);
}

const sql = neon(process.env.DATABASE_URL);

async function hash(pw) {
  return bcrypt.hash(pw, 12);
}

async function seed() {
  console.log("\n🌱  Seeding demo accounts...\n");

  // ── Patient ──────────────────────────────────────────────
  const patPw   = "Test1234!";
  const patHash = await hash(patPw);
  await sql`
    INSERT INTO patients
      (first_name, last_name, email, phone, gender, patient_number, password_hash, email_verified)
    VALUES
      ('Test', 'Patient', 'test@patient.com', '+234 800 000 0001', 'male', 'ASE/2026/0001', ${patHash}, TRUE)
    ON CONFLICT (email) DO UPDATE
      SET password_hash   = EXCLUDED.password_hash,
          email_verified  = TRUE,
          updated_at      = NOW()
  `;
  console.log("✅  patient      →  test@patient.com          /  " + patPw);

  // ── Staff accounts ───────────────────────────────────────
  const staffAccounts = [
    { first:"Admin",    last:"User",    email:"admin@anya.com",      phone:"+234 800 000 0002", role:"admin",      dept:"Management", pw:"Admin1234!"     },
    { first:"Dr. Anya", last:"Kalu",    email:"doctor@anya.com",     phone:"+234 800 000 0003", role:"doctor",     dept:"Outpatient", pw:"Doctor1234!"    },
    { first:"Accounts", last:"Officer", email:"accounts@anya.com",   phone:"+234 800 000 0004", role:"accounts",   dept:"Accounts",   pw:"Accounts1234!"  },
    { first:"Front",    last:"Desk",    email:"frontdesk@anya.com",  phone:"+234 800 000 0005", role:"front_desk", dept:"Front Desk", pw:"Frontdesk1234!" },
    { first:"VA",       last:"Nurse",   email:"varoom@anya.com",     phone:"+234 800 000 0006", role:"va_room",    dept:"VA Room",    pw:"Varoom1234!"    },
    { first:"Scan",     last:"Tech",    email:"scanroom@anya.com",   phone:"+234 800 000 0007", role:"scan_room",  dept:"Scan Room",  pw:"Scanroom1234!"  },
    { first:"Theatre",  last:"Nurse",   email:"theatre@anya.com",    phone:"+234 800 000 0008", role:"theatre",    dept:"Theatre",    pw:"Theatre1234!"   },
    { first:"Pharm",    last:"Tech",    email:"pharmacy@anya.com",   phone:"+234 800 000 0009", role:"pharmacy",   dept:"Pharmacy",   pw:"Pharmacy1234!"  },
  ];

  for (const s of staffAccounts) {
    const h = await hash(s.pw);
    await sql`
      INSERT INTO staff
        (first_name, last_name, email, phone, role, department, password_hash, is_active)
      VALUES
        (${s.first}, ${s.last}, ${s.email}, ${s.phone}, ${s.role}, ${s.dept}, ${h}, TRUE)
      ON CONFLICT (email) DO UPDATE
        SET password_hash = EXCLUDED.password_hash,
            is_active     = TRUE,
            updated_at    = NOW()
    `;
    const label = (s.role + "          ").slice(0, 12);
    console.log("✅  " + label + "  →  " + s.email.padEnd(28) + "  /  " + s.pw);
  }

  console.log("\n🎉  All demo accounts seeded!\n");
  console.log("   Patient portal:  http://localhost:3000/portal/login");
  console.log("   Staff portal:    http://localhost:3000/staff/login\n");
  console.log("   Staff credentials:");
  console.log("   admin@anya.com        Admin1234!");
  console.log("   doctor@anya.com       Doctor1234!");
  console.log("   frontdesk@anya.com    Frontdesk1234!");
  console.log("   varoom@anya.com       Varoom1234!");
  console.log("   accounts@anya.com     Accounts1234!");
  console.log("   scanroom@anya.com     Scanroom1234!");
  console.log("   theatre@anya.com      Theatre1234!");
  console.log("   pharmacy@anya.com     Pharmacy1234!");
  console.log("   test@patient.com      Test1234!\n");
}

seed().catch(err => {
  console.error("\n❌  Seed failed:", err.message);
  console.error(err);
  process.exit(1);
});
