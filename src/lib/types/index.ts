// ── Enums ──────────────────────────────────────────────────────────────────

export type UserRole =
  | "admin" | "doctor" | "front_desk" | "va_room"
  | "accounts" | "scan_room" | "theatre" | "pharmacy" | "patient";

export type VisitStatus =
  | "registered" | "awaiting_payment" | "vision_assessment"
  | "awaiting_doctor" | "with_doctor" | "awaiting_scan_payment"
  | "scan_booked" | "scan_done" | "awaiting_surgery"
  | "surgery_booked" | "pharmacy" | "completed" | "cancelled";

export type PaymentMethod = "cash" | "pos" | "transfer" | "hmo" | "clinic_billed" | "paystack" | "other";
export type PaymentType   = "consultation" | "express_service" | "medication" | "scan" | "surgery" | "other";
export type PaymentStatus = "pending" | "paid" | "waived" | "refunded";
export type AppointmentStatus = "pending" | "confirmed" | "cancelled" | "completed" | "no_show";
export type EyeSide    = "right" | "left" | "both";
export type ScanType   = "fundus_photo" | "oct_macular" | "oct_disc" | "gonioscopy" | "pachymetry" | "b_scan" | "visual_field" | "topography" | "other";
export type SurgeryType = "phacoemulsification" | "glaucoma_surgery" | "trabeculectomy" | "vitrectomy" | "pterygium" | "enucleation" | "evisceration" | "lid_surgery" | "squint_surgery" | "dce" | "other";

// ── Entities ────────────────────────────────────────────────────────────────

export interface Patient {
  id: string;
  first_name: string;
  last_name: string;
  middle_name?: string;
  date_of_birth?: string;
  gender?: string;
  phone?: string;
  email?: string;
  address?: string;
  state_of_origin?: string;
  occupation?: string;
  next_of_kin?: string;
  next_of_kin_phone?: string;
  blood_group?: string;
  genotype?: string;
  allergies?: string;
  patient_number?: string;
  hmo_name?: string;
  hmo_number?: string;
  email_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface Staff {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  role: UserRole;
  department?: string;
  is_active: boolean;
  avatar_url?: string;
  created_at: string;
}

export interface Visit {
  id: string;
  patient_id: string;
  visit_date: string;
  tally_number?: string;
  visit_type: string;
  status: VisitStatus;
  chief_complaint?: string;
  is_express: boolean;
  registered_by?: string;
  created_at: string;
  // Joined
  patient?: Patient;
}

export interface Vitals {
  id: string;
  visit_id: string;
  weight_kg?: number;
  height_cm?: number;
  bmi?: number;
  bp_systolic?: number;
  bp_diastolic?: number;
  pulse_bpm?: number;
  temperature_c?: number;
  spo2_percent?: number;
  blood_sugar?: number;
  notes?: string;
  recorded_at: string;
}

export interface VisionAssessment {
  id: string;
  visit_id: string;
  va_right_unaided?: string;
  va_left_unaided?: string;
  va_right_aided?: string;
  va_left_aided?: string;
  va_right_ph?: string;
  va_left_ph?: string;
  colour_vision_right?: string;
  colour_vision_left?: string;
  iop_right?: number;
  iop_left?: number;
  iop_method?: string;
  confrontation_vf?: string;
  cover_test?: string;
  motility?: string;
  pupil_right?: string;
  pupil_left?: string;
  notes?: string;
  recorded_at: string;
}

export interface ClinicalNote {
  id: string;
  visit_id: string;
  history_presenting_complaint?: string;
  past_ocular_history?: string;
  past_medical_history?: string;
  family_history?: string;
  drug_history?: string;
  social_history?: string;
  anterior_segment_right?: string;
  anterior_segment_left?: string;
  posterior_segment_right?: string;
  posterior_segment_left?: string;
  diagnosis_right?: string;
  diagnosis_left?: string;
  icd_codes?: string;
  management_plan?: string;
  follow_up_date?: string;
  follow_up_notes?: string;
  doctor_id?: string;
  signed_at?: string;
  created_at: string;
}

export interface Prescription {
  id: string;
  visit_id: string;
  drug_name: string;
  dosage?: string;
  frequency?: string;
  duration?: string;
  route?: string;
  eye_side?: EyeSide;
  instructions?: string;
  quantity?: number;
  dispensed: boolean;
  dispensed_at?: string;
  prescribed_by?: string;
  created_at: string;
}

export interface Payment {
  id: string;
  visit_id: string;
  patient_id: string;
  type: PaymentType;
  description?: string;
  amount: number;
  method?: PaymentMethod;
  status: PaymentStatus;
  receipt_number?: string;
  paystack_ref?: string;
  hmo_name?: string;
  hmo_auth_code?: string;
  notes?: string;
  paid_at?: string;
  created_at: string;
}

export interface Scan {
  id: string;
  visit_id: string;
  type: ScanType;
  eye_side?: EyeSide;
  indication?: string;
  findings?: string;
  image_urls?: string[];
  report_url?: string;
  performed_by?: string;
  interpreted_by?: string;
  payment_id?: string;
  performed_at: string;
}

export interface Surgery {
  id: string;
  visit_id: string;
  type: SurgeryType;
  eye_side: EyeSide;
  indication?: string;
  preop_va_right?: string;
  preop_va_left?: string;
  preop_iop_right?: number;
  preop_iop_left?: number;
  lens_brand?: string;
  lens_model?: string;
  lens_power?: number;
  lens_position?: string;
  surgeon_id?: string;
  anaesthesia?: string;
  complications?: string;
  technique_notes?: string;
  duration_mins?: number;
  postop_va_right?: string;
  postop_va_left?: string;
  bscan_urls?: string[];
  scheduled_at?: string;
  performed_at?: string;
  created_at: string;
}

export interface Appointment {
  id: string;
  patient_id: string;
  appointment_date: string;
  appointment_time: string;
  type: string;
  reason?: string;
  status: AppointmentStatus;
  is_telemedicine: boolean;
  video_room_url?: string;
  payment_id?: string;
  notes?: string;
  created_at: string;
  // Joined
  patient?: Patient;
}

export interface QueueEntry {
  id: string;
  visit_id: string;
  patient_id: string;
  queue_date: string;
  tally_number: number;
  department: string;
  status: string;
  called_at?: string;
  done_at?: string;
  created_at: string;
  // Joined
  patient?: Patient;
  visit?: Visit;
}

export interface ChatMessage {
  id: string;
  patient_id: string;
  sender_type: "patient" | "staff" | "ai";
  sender_id?: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

// ── Session user (NextAuth) ──────────────────────────────────────────────────
export interface SessionUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  type: "patient" | "staff";
}
