-- SmartVision Eye Clinic — Complete Database Schema
-- Neon PostgreSQL | Run once to initialise

-- ══════════════════════════════════════════════════════════════════
-- ENUMS
-- ══════════════════════════════════════════════════════════════════

CREATE TYPE user_role AS ENUM (
  'admin', 'doctor', 'front_desk', 'va_room',
  'accounts', 'scan_room', 'theatre', 'pharmacy', 'patient'
);

CREATE TYPE visit_status AS ENUM (
  'registered', 'awaiting_payment', 'vision_assessment',
  'awaiting_doctor', 'with_doctor', 'awaiting_scan_payment',
  'scan_booked', 'scan_done', 'awaiting_surgery',
  'surgery_booked', 'pharmacy', 'completed', 'cancelled'
);

CREATE TYPE payment_method AS ENUM (
  'cash', 'pos', 'transfer', 'hmo', 'clinic_billed', 'paystack', 'other'
);

CREATE TYPE payment_type AS ENUM (
  'consultation', 'express_service', 'medication', 'scan',
  'surgery', 'other'
);

CREATE TYPE payment_status AS ENUM ('pending', 'paid', 'waived', 'refunded');

CREATE TYPE appointment_status AS ENUM (
  'pending', 'confirmed', 'cancelled', 'completed', 'no_show'
);

CREATE TYPE eye_side AS ENUM ('right', 'left', 'both');

CREATE TYPE scan_type AS ENUM (
  'fundus_photo', 'oct_macular', 'oct_disc', 'gonioscopy',
  'pachymetry', 'b_scan', 'visual_field', 'topography', 'other'
);

CREATE TYPE surgery_type AS ENUM (
  'phacoemulsification', 'glaucoma_surgery', 'trabeculectomy',
  'vitrectomy', 'pterygium', 'enucleation', 'evisceration',
  'lid_surgery', 'squint_surgery', 'dce', 'other'
);

-- ══════════════════════════════════════════════════════════════════
-- USERS (patients)
-- ══════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS patients (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name      VARCHAR(100) NOT NULL,
  last_name       VARCHAR(100) NOT NULL,
  middle_name     VARCHAR(100),
  date_of_birth   DATE,
  gender          VARCHAR(20),
  phone           VARCHAR(20),
  email           VARCHAR(255) UNIQUE,
  address         TEXT,
  state_of_origin VARCHAR(100),
  occupation      VARCHAR(100),
  next_of_kin     VARCHAR(200),
  next_of_kin_phone VARCHAR(20),
  blood_group     VARCHAR(10),
  genotype        VARCHAR(10),
  allergies       TEXT,
  -- Auth
  password_hash   VARCHAR(255),
  otp_secret      VARCHAR(100),
  otp_expires_at  TIMESTAMP,
  email_verified  BOOLEAN DEFAULT FALSE,
  -- Meta
  patient_number  VARCHAR(20) UNIQUE,  -- clinic's own ID e.g. ASE/2024/001
  hmo_name        VARCHAR(100),
  hmo_number      VARCHAR(100),
  imported        BOOLEAN DEFAULT FALSE,
  created_at      TIMESTAMP DEFAULT NOW(),
  updated_at      TIMESTAMP DEFAULT NOW()
);

-- ══════════════════════════════════════════════════════════════════
-- STAFF
-- ══════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS staff (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name      VARCHAR(100) NOT NULL,
  last_name       VARCHAR(100) NOT NULL,
  email           VARCHAR(255) UNIQUE NOT NULL,
  phone           VARCHAR(20),
  role            user_role NOT NULL,
  department      VARCHAR(100),
  password_hash   VARCHAR(255) NOT NULL,
  is_active       BOOLEAN DEFAULT TRUE,
  approved_by     UUID REFERENCES staff(id),
  approved_at     TIMESTAMP,
  created_by      UUID REFERENCES staff(id),
  avatar_url      VARCHAR(500),
  created_at      TIMESTAMP DEFAULT NOW(),
  updated_at      TIMESTAMP DEFAULT NOW()
);

-- ══════════════════════════════════════════════════════════════════
-- VISITS (each clinic visit = one row, the "tally")
-- ══════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS visits (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id      UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  visit_date      DATE NOT NULL DEFAULT CURRENT_DATE,
  tally_number    VARCHAR(10),           -- e.g. "042"
  visit_type      VARCHAR(50) DEFAULT 'outpatient',  -- outpatient, follow_up, surgery
  status          visit_status DEFAULT 'registered',
  chief_complaint TEXT,
  is_express      BOOLEAN DEFAULT FALSE,
  registered_by   UUID REFERENCES staff(id),
  created_at      TIMESTAMP DEFAULT NOW(),
  updated_at      TIMESTAMP DEFAULT NOW()
);

-- ══════════════════════════════════════════════════════════════════
-- VITALS (front desk)
-- ══════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS vitals (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  visit_id        UUID NOT NULL REFERENCES visits(id) ON DELETE CASCADE,
  weight_kg       DECIMAL(5,2),
  height_cm       DECIMAL(5,2),
  bmi             DECIMAL(4,2),
  bp_systolic     INTEGER,
  bp_diastolic    INTEGER,
  pulse_bpm       INTEGER,
  temperature_c   DECIMAL(4,1),
  spo2_percent    INTEGER,
  blood_sugar     DECIMAL(5,1),
  recorded_by     UUID REFERENCES staff(id),
  notes           TEXT,
  recorded_at     TIMESTAMP DEFAULT NOW()
);

-- ══════════════════════════════════════════════════════════════════
-- VISION ASSESSMENTS (VA room)
-- ══════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS vision_assessments (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  visit_id        UUID NOT NULL REFERENCES visits(id) ON DELETE CASCADE,
  -- Visual Acuity
  va_right_unaided  VARCHAR(20),   -- e.g. "6/6", "6/60", "CF", "HM", "PL", "NPL"
  va_left_unaided   VARCHAR(20),
  va_right_aided    VARCHAR(20),   -- with glasses/PH
  va_left_aided     VARCHAR(20),
  va_right_ph       VARCHAR(20),   -- pinhole
  va_left_ph        VARCHAR(20),
  -- Colour Vision
  colour_vision_right VARCHAR(50),
  colour_vision_left  VARCHAR(50),
  -- Intraocular Pressure (Goldmann / Non-contact)
  iop_right       DECIMAL(4,1),   -- mmHg
  iop_left        DECIMAL(4,1),
  iop_method      VARCHAR(50),    -- "NCT", "Goldmann", "iCare"
  iop_time        TIME,
  -- Other
  confrontation_vf TEXT,          -- confrontation visual fields notes
  cover_test      TEXT,
  motility        TEXT,
  pupil_right     TEXT,           -- e.g. "3mm reacting to light"
  pupil_left      TEXT,
  recorded_by     UUID REFERENCES staff(id),
  notes           TEXT,
  recorded_at     TIMESTAMP DEFAULT NOW()
);

-- ══════════════════════════════════════════════════════════════════
-- DIAGNOSES & CLINICAL NOTES (doctor)
-- ══════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS clinical_notes (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  visit_id        UUID NOT NULL REFERENCES visits(id) ON DELETE CASCADE,
  -- History
  history_presenting_complaint TEXT,
  past_ocular_history          TEXT,
  past_medical_history         TEXT,
  family_history               TEXT,
  drug_history                 TEXT,
  social_history               TEXT,
  -- Examination
  anterior_segment_right  TEXT,
  anterior_segment_left   TEXT,
  posterior_segment_right TEXT,
  posterior_segment_left  TEXT,
  -- Diagnosis
  diagnosis_right   TEXT,
  diagnosis_left    TEXT,
  icd_codes         TEXT,          -- comma-separated ICD-10 codes
  -- Plan
  management_plan   TEXT,
  follow_up_date    DATE,
  follow_up_notes   TEXT,
  -- Doctor
  doctor_id         UUID REFERENCES staff(id),
  signed_at         TIMESTAMP,
  created_at        TIMESTAMP DEFAULT NOW(),
  updated_at        TIMESTAMP DEFAULT NOW()
);

-- ══════════════════════════════════════════════════════════════════
-- PRESCRIPTIONS (doctor → pharmacy)
-- ══════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS prescriptions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  visit_id        UUID NOT NULL REFERENCES visits(id) ON DELETE CASCADE,
  drug_name       VARCHAR(200) NOT NULL,
  dosage          VARCHAR(100),
  frequency       VARCHAR(100),  -- e.g. "3 times daily"
  duration        VARCHAR(100),  -- e.g. "7 days"
  route           VARCHAR(50),   -- "oral", "topical", "IV"
  eye_side        eye_side,
  instructions    TEXT,
  quantity        INTEGER,
  dispensed       BOOLEAN DEFAULT FALSE,
  dispensed_by    UUID REFERENCES staff(id),
  dispensed_at    TIMESTAMP,
  prescribed_by   UUID REFERENCES staff(id),
  created_at      TIMESTAMP DEFAULT NOW()
);

-- ══════════════════════════════════════════════════════════════════
-- PAYMENTS (accounts)
-- ══════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS payments (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  visit_id        UUID NOT NULL REFERENCES visits(id) ON DELETE CASCADE,
  patient_id      UUID NOT NULL REFERENCES patients(id),
  type            payment_type NOT NULL,
  description     TEXT,
  amount          DECIMAL(10,2) NOT NULL,
  method          payment_method,
  status          payment_status DEFAULT 'pending',
  receipt_number  VARCHAR(50),
  paystack_ref    VARCHAR(100),
  hmo_name        VARCHAR(100),
  hmo_auth_code   VARCHAR(100),
  recorded_by     UUID REFERENCES staff(id),
  verified_by     UUID REFERENCES staff(id),
  notes           TEXT,
  paid_at         TIMESTAMP,
  created_at      TIMESTAMP DEFAULT NOW()
);

-- ══════════════════════════════════════════════════════════════════
-- SCANS / INVESTIGATIONS (scan room + OCT)
-- ══════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS scans (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  visit_id        UUID NOT NULL REFERENCES visits(id) ON DELETE CASCADE,
  type            scan_type NOT NULL,
  eye_side        eye_side,
  indication      TEXT,
  findings        TEXT,
  image_urls      TEXT[],          -- Cloudinary URLs array
  report_url      VARCHAR(500),
  performed_by    UUID REFERENCES staff(id),
  interpreted_by  UUID REFERENCES staff(id),  -- doctor
  payment_id      UUID REFERENCES payments(id),
  performed_at    TIMESTAMP DEFAULT NOW(),
  created_at      TIMESTAMP DEFAULT NOW()
);

-- ══════════════════════════════════════════════════════════════════
-- SURGERIES (theatre)
-- ══════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS surgeries (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  visit_id        UUID NOT NULL REFERENCES visits(id) ON DELETE CASCADE,
  type            surgery_type NOT NULL,
  eye_side        eye_side NOT NULL,
  indication      TEXT,
  -- Pre-op
  preop_va_right  VARCHAR(20),
  preop_va_left   VARCHAR(20),
  preop_iop_right DECIMAL(4,1),
  preop_iop_left  DECIMAL(4,1),
  preop_notes     TEXT,
  biometry_data   JSONB,           -- AL, K1, K2, ACD, etc.
  -- Lens (for cataract)
  lens_brand      VARCHAR(100),
  lens_model      VARCHAR(100),
  lens_power      DECIMAL(5,2),
  lens_position   VARCHAR(50),     -- "in-the-bag", "sulcus", "ACIOL"
  -- Intraop
  surgeon_id      UUID REFERENCES staff(id),
  anaesthesia     VARCHAR(100),
  intraop_vitals  JSONB,           -- {bp, pulse, spo2} at intervals
  intraop_drugs   JSONB,           -- [{drug, dose, time}]
  complications   TEXT,
  technique_notes TEXT,
  duration_mins   INTEGER,
  -- Post-op
  postop_va_right VARCHAR(20),
  postop_va_left  VARCHAR(20),
  postop_iop_right DECIMAL(4,1),
  postop_iop_left  DECIMAL(4,1),
  postop_notes    TEXT,
  -- B-scan
  bscan_urls      TEXT[],
  -- Status
  scheduled_at    TIMESTAMP,
  performed_at    TIMESTAMP,
  payment_id      UUID REFERENCES payments(id),
  created_at      TIMESTAMP DEFAULT NOW(),
  updated_at      TIMESTAMP DEFAULT NOW()
);

-- ══════════════════════════════════════════════════════════════════
-- APPOINTMENTS (online booking)
-- ══════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS appointments (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id      UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  appointment_date DATE NOT NULL,
  appointment_time TIME NOT NULL,
  type            VARCHAR(50) DEFAULT 'consultation',
  reason          TEXT,
  status          appointment_status DEFAULT 'pending',
  is_telemedicine BOOLEAN DEFAULT FALSE,
  video_room_url  VARCHAR(500),
  payment_id      UUID REFERENCES payments(id),
  notes           TEXT,
  booked_by       UUID REFERENCES staff(id),  -- NULL if self-booked
  confirmed_by    UUID REFERENCES staff(id),
  created_at      TIMESTAMP DEFAULT NOW(),
  updated_at      TIMESTAMP DEFAULT NOW()
);

-- ══════════════════════════════════════════════════════════════════
-- QUEUE (daily)
-- ══════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS queue (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  visit_id        UUID NOT NULL REFERENCES visits(id) ON DELETE CASCADE,
  patient_id      UUID NOT NULL REFERENCES patients(id),
  queue_date      DATE NOT NULL DEFAULT CURRENT_DATE,
  tally_number    INTEGER NOT NULL,
  department      VARCHAR(50) NOT NULL,  -- 'front_desk','va_room','doctor','accounts','scan','theatre','pharmacy'
  status          VARCHAR(20) DEFAULT 'waiting',  -- waiting, called, in_progress, done, skipped
  called_at       TIMESTAMP,
  done_at         TIMESTAMP,
  created_at      TIMESTAMP DEFAULT NOW()
);

-- ══════════════════════════════════════════════════════════════════
-- CHAT MESSAGES (telemedicine text)
-- ══════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS chat_messages (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id      UUID NOT NULL REFERENCES patients(id),
  sender_type     VARCHAR(20) NOT NULL,  -- 'patient', 'staff', 'ai'
  sender_id       VARCHAR(100),          -- patient.id or staff.id
  message         TEXT NOT NULL,
  is_read         BOOLEAN DEFAULT FALSE,
  created_at      TIMESTAMP DEFAULT NOW()
);

-- ══════════════════════════════════════════════════════════════════
-- INDEXES
-- ══════════════════════════════════════════════════════════════════

CREATE INDEX IF NOT EXISTS idx_visits_patient       ON visits(patient_id);
CREATE INDEX IF NOT EXISTS idx_visits_date          ON visits(visit_date);
CREATE INDEX IF NOT EXISTS idx_visits_status        ON visits(status);
CREATE INDEX IF NOT EXISTS idx_vitals_visit         ON vitals(visit_id);
CREATE INDEX IF NOT EXISTS idx_va_visit             ON vision_assessments(visit_id);
CREATE INDEX IF NOT EXISTS idx_clinical_visit       ON clinical_notes(visit_id);
CREATE INDEX IF NOT EXISTS idx_prescriptions_visit  ON prescriptions(visit_id);
CREATE INDEX IF NOT EXISTS idx_payments_visit       ON payments(visit_id);
CREATE INDEX IF NOT EXISTS idx_payments_patient     ON payments(patient_id);
CREATE INDEX IF NOT EXISTS idx_scans_visit          ON scans(visit_id);
CREATE INDEX IF NOT EXISTS idx_surgeries_visit      ON surgeries(visit_id);
CREATE INDEX IF NOT EXISTS idx_appointments_patient ON appointments(patient_id);
CREATE INDEX IF NOT EXISTS idx_appointments_date    ON appointments(appointment_date);
CREATE INDEX IF NOT EXISTS idx_queue_date_dept      ON queue(queue_date, department);
CREATE INDEX IF NOT EXISTS idx_chat_patient         ON chat_messages(patient_id);
CREATE INDEX IF NOT EXISTS idx_patients_number      ON patients(patient_number);
