#!/usr/bin/env node
import { config } from "dotenv";
import { neon } from "@neondatabase/serverless";

config({ path: ".env.local" });

if (!process.env.DATABASE_URL) {
  console.error("\n❌  DATABASE_URL not set in .env.local\n"); process.exit(1);
}
const sql = neon(process.env.DATABASE_URL);

async function migrate() {
  console.log("\n🔧  Running migrations...\n");

  await sql`CREATE TABLE IF NOT EXISTS patients (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    first_name       TEXT NOT NULL,
    last_name        TEXT NOT NULL,
    middle_name      TEXT,
    email            TEXT UNIQUE,
    phone            TEXT,
    gender           TEXT,
    date_of_birth    DATE,
    patient_number   TEXT UNIQUE,
    password_hash    TEXT,
    email_verified   BOOLEAN DEFAULT FALSE,
    hmo_name         TEXT,
    hmo_number       TEXT,
    address          TEXT,
    state_of_origin  TEXT,
    occupation       TEXT,
    next_of_kin      TEXT,
    next_of_kin_phone TEXT,
    blood_group      TEXT,
    genotype         TEXT,
    allergies        TEXT,
    created_at       TIMESTAMPTZ DEFAULT NOW(),
    updated_at       TIMESTAMPTZ DEFAULT NOW()
  )`;
  console.log("✅  patients");

  await sql`CREATE TABLE IF NOT EXISTS staff (
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

  await sql`CREATE TABLE IF NOT EXISTS visits (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id      UUID REFERENCES patients(id),
    tally_number    TEXT,
    visit_date      DATE DEFAULT CURRENT_DATE,
    status          TEXT DEFAULT 'registered',
    is_express      BOOLEAN DEFAULT FALSE,
    chief_complaint TEXT,
    registered_by   UUID REFERENCES staff(id),
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
  )`;
  console.log("✅  visits");

  await sql`CREATE TABLE IF NOT EXISTS vitals (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    visit_id      UUID UNIQUE REFERENCES visits(id),
    weight_kg     NUMERIC(5,2),
    height_cm     NUMERIC(5,2),
    bmi           NUMERIC(5,2),
    bp_systolic   INTEGER,
    bp_diastolic  INTEGER,
    pulse_bpm     INTEGER,
    temperature_c NUMERIC(4,1),
    spo2_percent  INTEGER,
    blood_sugar   NUMERIC(6,2),
    notes         TEXT,
    recorded_by   UUID REFERENCES staff(id),
    created_at    TIMESTAMPTZ DEFAULT NOW()
  )`;
  console.log("✅  vitals");

  await sql`CREATE TABLE IF NOT EXISTS va_records (
    id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    visit_id             UUID UNIQUE REFERENCES visits(id),
    va_right_unaided     TEXT, va_left_unaided  TEXT,
    va_right_aided       TEXT, va_left_aided    TEXT,
    va_right_ph          TEXT, va_left_ph       TEXT,
    iop_right            TEXT, iop_left         TEXT,
    iop_method           TEXT DEFAULT 'NCT',
    colour_vision_right  TEXT, colour_vision_left TEXT,
    confrontation_vf     TEXT, cover_test       TEXT,
    motility             TEXT,
    pupil_right          TEXT, pupil_left       TEXT,
    notes                TEXT,
    recorded_by          UUID REFERENCES staff(id),
    created_at           TIMESTAMPTZ DEFAULT NOW()
  )`;
  console.log("✅  va_records");

  await sql`CREATE TABLE IF NOT EXISTS payments (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    visit_id     UUID REFERENCES visits(id),
    patient_id   UUID REFERENCES patients(id),
    type         TEXT,
    description  TEXT,
    amount       NUMERIC(12,2),
    method       TEXT,
    status       TEXT DEFAULT 'paid',
    receipt_no   TEXT UNIQUE,
    hmo_name     TEXT,
    hmo_auth     TEXT,
    notes        TEXT,
    recorded_by  UUID REFERENCES staff(id),
    paid_at      TIMESTAMPTZ DEFAULT NOW(),
    created_at   TIMESTAMPTZ DEFAULT NOW()
  )`;
  console.log("✅  payments");

  await sql`CREATE TABLE IF NOT EXISTS clinical_notes (
    id                           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    visit_id                     UUID UNIQUE REFERENCES visits(id),
    history_presenting_complaint TEXT,
    past_ocular_history          TEXT,
    past_medical_history         TEXT,
    family_history               TEXT,
    drug_history                 TEXT,
    social_history               TEXT,
    anterior_segment_right       TEXT,
    anterior_segment_left        TEXT,
    posterior_segment_right      TEXT,
    posterior_segment_left       TEXT,
    diagnosis_right              TEXT,
    diagnosis_left               TEXT,
    icd_codes                    TEXT,
    management_plan              TEXT,
    follow_up_date               DATE,
    doctor_id                    UUID REFERENCES staff(id),
    created_at                   TIMESTAMPTZ DEFAULT NOW(),
    updated_at                   TIMESTAMPTZ DEFAULT NOW()
  )`;
  console.log("✅  clinical_notes");

  await sql`CREATE TABLE IF NOT EXISTS prescriptions (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    visit_id     UUID REFERENCES visits(id),
    drug_name    TEXT NOT NULL,
    dosage       TEXT,
    frequency    TEXT,
    duration     TEXT,
    route        TEXT,
    eye_side     TEXT,
    quantity     TEXT,
    instructions TEXT,
    dispensed    BOOLEAN DEFAULT FALSE,
    dispensed_at TIMESTAMPTZ,
    dispensed_by UUID REFERENCES staff(id),
    created_at   TIMESTAMPTZ DEFAULT NOW()
  )`;
  console.log("✅  prescriptions");

  await sql`CREATE TABLE IF NOT EXISTS scans (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    visit_id     UUID REFERENCES visits(id),
    scan_type    TEXT NOT NULL,
    eye_side     TEXT,
    indication   TEXT,
    image_urls   TEXT[],
    findings     TEXT,
    performed_by UUID REFERENCES staff(id),
    created_at   TIMESTAMPTZ DEFAULT NOW()
  )`;
  console.log("✅  scans");

  await sql`CREATE TABLE IF NOT EXISTS surgeries (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    visit_id         UUID REFERENCES visits(id),
    surgery_type     TEXT NOT NULL,
    eye_side         TEXT,
    indication       TEXT,
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
    bscan_urls       TEXT[],
    performed_at     TIMESTAMPTZ,
    surgeon_id       UUID REFERENCES staff(id),
    created_at       TIMESTAMPTZ DEFAULT NOW()
  )`;
  console.log("✅  surgeries");

  await sql`CREATE TABLE IF NOT EXISTS appointments (
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

  await sql`CREATE TABLE IF NOT EXISTS queue (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    visit_id     UUID REFERENCES visits(id),
    patient_id   UUID REFERENCES patients(id),
    tally_number INTEGER,
    department   TEXT DEFAULT 'front_desk',
    status       TEXT DEFAULT 'waiting',
    queue_date   DATE DEFAULT CURRENT_DATE,
    called_at    TIMESTAMPTZ,
    done_at      TIMESTAMPTZ,
    created_at   TIMESTAMPTZ DEFAULT NOW()
  )`;
  console.log("✅  queue");

  await sql`CREATE TABLE IF NOT EXISTS otp_tokens (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email      TEXT NOT NULL,
    token      TEXT NOT NULL,
    type       TEXT DEFAULT 'patient',
    expires_at TIMESTAMPTZ NOT NULL,
    used       BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
  )`;
  console.log("✅  otp_tokens");

  console.log("\n🎉  All migrations complete! Run: node scripts/seed.js\n");
}

migrate().catch(err => {
  console.error("\n❌  Migration failed:", err.message, "\n"); process.exit(1);
});
