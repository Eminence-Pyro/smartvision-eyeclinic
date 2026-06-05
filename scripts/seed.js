#!/usr/bin/env node
/**
 * Creates test accounts for development/demo.
 * Usage: node scripts/seed.js
 *
 * Creates:
 *   PATIENT  — test@patient.com  / Test1234!
 *   ADMIN    — admin@anya.com    / Admin1234!
 *   DOCTOR   — doctor@anya.com   / Doctor1234!
 *   ACCOUNTS — accounts@anya.com / Accounts1234!
 */

require("dotenv").config({ path: ".env.local" });
const { neon } = require("@neondatabase/serverless");
const bcrypt    = require("bcryptjs");

async function seed() {
  if (!process.env.DATABASE_URL) {
    console.error("❌  DATABASE_URL not set. Check .env.local");
    process.exit(1);
  }
  const sql = neon(process.env.DATABASE_URL);

  const hash = (pw) => bcrypt.hash(pw, 12);

  /* ── 1. Patient account ── */
  const patientHash = await hash("Test1234!");
  await sql`
    INSERT INTO patients
      (first_name, last_name, email, phone, gender, patient_number, password_hash, email_verified)
    VALUES
      ('Test', 'Patient', 'test@patient.com', '+234 800 000 0001', 'male', 'ASE/2026/0001', ${patientHash}, TRUE)
    ON CONFLICT (email) DO UPDATE
      SET password_hash = EXCLUDED.password_hash,
          patient_number = COALESCE(patients.patient_number, EXCLUDED.patient_number)
  `;
  console.log("✅  Patient  →  test@patient.com  /  Test1234!");

  /* ── 2. Admin / CMD staff account ── */
  const adminHash = await hash("Admin1234!");
  await sql`
    INSERT INTO staff
      (first_name, last_name, email, phone, role, department, password_hash, is_active)
    VALUES
      ('Admin', 'User', 'admin@anya.com', '+234 800 000 0002', 'admin', 'Management', ${adminHash}, TRUE)
    ON CONFLICT (email) DO UPDATE
      SET password_hash = EXCLUDED.password_hash
  `;
  console.log("✅  Admin    →  admin@anya.com    /  Admin1234!");

  /* ── 3. Doctor account ── */
  const doctorHash = await hash("Doctor1234!");
  await sql`
    INSERT INTO staff
      (first_name, last_name, email, phone, role, department, password_hash, is_active)
    VALUES
      ('Dr. Anya', 'Specialist', 'doctor@anya.com', '+234 800 000 0003', 'doctor', 'Outpatient', ${doctorHash}, TRUE)
    ON CONFLICT (email) DO UPDATE
      SET password_hash = EXCLUDED.password_hash
  `;
  console.log("✅  Doctor   →  doctor@anya.com   /  Doctor1234!");

  /* ── 4. Accounts staff ── */
  const accHash = await hash("Accounts1234!");
  await sql`
    INSERT INTO staff
      (first_name, last_name, email, phone, role, department, password_hash, is_active)
    VALUES
      ('Accounts', 'Staff', 'accounts@anya.com', '+234 800 000 0004', 'accounts', 'Accounts', ${accHash}, TRUE)
    ON CONFLICT (email) DO UPDATE
      SET password_hash = EXCLUDED.password_hash
  `;
  console.log("✅  Accounts →  accounts@anya.com /  Accounts1234!");

  console.log("\n🎉  All test accounts ready! Run \'npm run dev\' to test.");
}

seed().catch(err => { console.error("❌ Seed failed:", err.message); process.exit(1); });
