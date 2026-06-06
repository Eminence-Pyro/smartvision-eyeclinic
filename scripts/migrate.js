#!/usr/bin/env node
/**
 * SmartVision Database Migration
 * Run: node scripts/migrate.js
 * Creates all tables needed for the app.
 */

require("dotenv").config({ path: ".env.local" });
const { neon } = require("@neondatabase/serverless");

if (!process.env.DATABASE_URL) {
  console.error("\n❌  DATABASE_URL not set in .env.local\n");
  process.exit(1);
}

const sql = neon(process.env.DATABASE_URL);

async function migrate() {
  console.log("\n🔧  Running migrations...\n");

  await sql`
    CREATE TABLE IF NOT EXISTS patients (
      id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      first_name       TEXT NOT NULL,
      last_name        TEXT NOT NULL,
      email            TEXT UNIQUE NOT NULL,
      phone            TEXT,
      gender           TEXT,
      date_of_birth    DATE,
      patient_number   TEXT UNIQUE,
      password_hash    TEXT,
      email_verified   BOOLEAN DEFAULT FALSE,
      hmo_name         TEXT,
      hmo_number       TEXT,
      address          TEXT,
      occupation       TEXT,
      allergies        TEXT,
      nok_name         TEXT,
      nok_phone        TEXT,
      nok_relationship TEXT,
      created_at       TIMESTAMPTZ DEFAULT NOW(),
      updated_at       TIMESTAMPTZ DEFAULT NOW()
    )`;
  console.log("✅  patients");

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
    )`;
  console.log("✅  staff");

  await sql`
    CREATE TABLE IF NOT EXISTS visits (
      id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      patient_id  UUID REFERENCES patients(id),
      tally_no    TEXT,
      visit_date  DATE DEFAULT CURRENT_DATE,
      visit_type  TEXT DEFAULT 'general',
      is_express  BOOLEAN DEFAULT FALSE,
      status      TEXT DEFAULT 'registered',
      department  TEXT,
      notes       TEXT,
      created_at  TIMESTAMPTZ DEFAULT NOW(),
      updated_at  TIMESTAMPTZ DEFAULT NOW()
    )`;
  console.log("✅  visits");

  await sql`
    CREATE TABLE IF NOT EXISTS vitals (
      id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      visit_id        UUID REFERENCES visits(id),
      bp_systolic     INTEGER,
      bp_diastolic    INTEGER,
      pulse           INTEGER,
      weight_kg       NUMERIC(5,2),
      height_cm       NUMERIC(5,2),
      bmi             NUMERIC(5,2),
      temperature_c   NUMERIC(4,1),
      spo2_pct        INTEGER,
      blood_sugar     NUMERIC(5,2),
      recorded_by     UUID REFERENCES staff(id),
      created_at      TIMESTAMPTZ DEFAULT NOW()
    )`;
  console.log("✅  vitals");

  await sql`
    CREATE TABLE IF NOT EXISTS va_records (
      id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      visit_id       UUID REFERENCES visits(id),
      re_unaided     TEXT, re_aided TEXT, re_pinhole TEXT,
      le_unaided     TEXT, le_aided TEXT, le_pinhole TEXT,
      iop_re         NUMERIC(5,2), iop_le NUMERIC(5,2),
      iop_method     TEXT,
      colour_vision  TEXT, cover_test TEXT,
      motility       TEXT, confrontation_vf TEXT, pupils TEXT,
      recorded_by    UUID REFERENCES staff(id),
      created_at     TIMESTAMPTZ DEFAULT NOW()
    )`;
  console.log("✅  va_records");

  await sql`
    CREATE TABLE IF NOT EXISTS payments (
      id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      visit_id    UUID REFERENCES visits(id),
      type        TEXT,
      amount      NUMERIC(12,2),
      method      TEXT,
      hmo_name    TEXT,
      hmo_auth    TEXT,
      receipt_no  TEXT,
      status      TEXT DEFAULT 'paid',
      recorded_by UUID REFERENCES staff(id),
      created_at  TIMESTAMPTZ DEFAULT NOW()
    )`;
  console.log("✅  payments");

  await sql`
    CREATE TABLE IF NOT EXISTS clinical_notes (
      id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      visit_id          UUID REFERENCES visits(id),
      complaint         TEXT,
      history           TEXT,
      past_ocular_hx    TEXT,
      past_medical_hx   TEXT,
      family_hx         TEXT,
      drug_hx           TEXT,
      social_hx         TEXT,
      ant_seg_re        TEXT,
      ant_seg_le        TEXT,
      post_seg_re       TEXT,
      post_seg_le       TEXT,
      diagnosis_right   TEXT,
      diagnosis_left    TEXT,
      management_plan   TEXT,
      follow_up_date    DATE,
      doctor_id         UUID REFERENCES staff(id),
      created_at        TIMESTAMPTZ DEFAULT NOW(),
      updated_at        TIMESTAMPTZ DEFAULT NOW()
    )`;
  console.log("✅  clinical_notes");

  await sql`
    CREATE TABLE IF NOT EXISTS prescriptions (
      id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      visit_id    UUID REFERENCES visits(id),
      drug_name   TEXT NOT NULL,
      dosage      TEXT,
      frequency   TEXT,
      duration    TEXT,
      route       TEXT,
      eye_side    TEXT,
      quantity    TEXT,
      instructions TEXT,
      dispensed   BOOLEAN DEFAULT FALSE,
      dispensed_at TIMESTAMPTZ,
      dispensed_by UUID REFERENCES staff(id),
      created_at  TIMESTAMPTZ DEFAULT NOW()
    )`;
  console.log("✅  prescriptions");

  await sql`
    CREATE TABLE IF NOT EXISTS scans (
      id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      visit_id    UUID REFERENCES visits(id),
      scan_type   TEXT NOT NULL,
      image_url   TEXT,
      findings    TEXT,
      performed_by UUID REFERENCES staff(id),
      created_at  TIMESTAMPTZ DEFAULT NOW()
    )`;
  console.log("✅  scans");

  await sql`
    CREATE TABLE IF NOT EXISTS surgeries (
      id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      visit_id         UUID REFERENCES visits(id),
      surgery_type     TEXT NOT NULL,
      anaesthesia_type TEXT,
      duration_min     INTEGER,
      iol_brand        TEXT,
      iol_model        TEXT,
      iol_power        NUMERIC(5,2),
      iol_position     TEXT,
      technique_notes  TEXT,
      complications    TEXT,
      post_op_va_re    TEXT,
      post_op_va_le    TEXT,
      post_op_iop_re   NUMERIC(5,2),
      post_op_iop_le   NUMERIC(5,2),
      bscan_url        TEXT,
      performed_at     TIMESTAMPTZ,
      surgeon_id       UUID REFERENCES staff(id),
      created_at       TIMESTAMPTZ DEFAULT NOW()
    )`;
  console.log("✅  surgeries");

  await sql`
    CREATE TABLE IF NOT EXISTS appointments (
      id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      patient_id   UUID REFERENCES patients(id),
      appt_date    DATE NOT NULL,
      appt_time    TEXT NOT NULL,
      visit_type   TEXT DEFAULT 'consultation',
      telemedicine BOOLEAN DEFAULT FALSE,
      notes        TEXT,
      status       TEXT DEFAULT 'pending',
      created_at   TIMESTAMPTZ DEFAULT NOW()
    )`;
  console.log("✅  appointments");

  await sql`
    CREATE TABLE IF NOT EXISTS queue (
      id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      visit_id     UUID REFERENCES visits(id),
      tally_no     TEXT,
      patient_name TEXT,
      department   TEXT,
      status       TEXT DEFAULT 'waiting',
      queue_date   DATE DEFAULT CURRENT_DATE,
      called_at    TIMESTAMPTZ,
      done_at      TIMESTAMPTZ,
      created_at   TIMESTAMPTZ DEFAULT NOW()
    )`;
  console.log("✅  queue");

  await sql`
    CREATE TABLE IF NOT EXISTS otp_tokens (
      id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      email      TEXT NOT NULL,
      token      TEXT NOT NULL,
      type       TEXT DEFAULT 'patient',
      expires_at TIMESTAMPTZ NOT NULL,
      used       BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )`;
  console.log("✅  otp_tokens");

  console.log("\n🎉  All migrations complete!\n");
  console.log("   Next step: node scripts/seed.js\n");
}

migrate().catch(err => {
  console.error("\n❌  Migration failed:", err.message, "\n");
  process.exit(1);
});
