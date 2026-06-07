// SmartVision shared TypeScript types

export interface Patient {
  id: string;
  first_name: string;
  last_name: string;
  middle_name?: string;
  email?: string;
  phone?: string;
  gender?: string;
  date_of_birth?: string;
  patient_number: string;
  hmo_name?: string;
  hmo_number?: string;
  address?: string;
  occupation?: string;
  next_of_kin?: string;
  next_of_kin_phone?: string;
  blood_group?: string;
  genotype?: string;
  allergies?: string;
  email_verified?: boolean;
  created_at?: string;
}

export interface Staff {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  role: StaffRole;
  department?: string;
  is_active: boolean;
  created_at?: string;
}

export type StaffRole =
  | "admin" | "doctor" | "front_desk" | "va_room"
  | "accounts" | "scan_room" | "theatre" | "pharmacy";

export interface Visit {
  id: string;
  patient_id: string;
  tally_number: string;
  visit_date: string;
  status: string;
  is_express: boolean;
  chief_complaint?: string;
  registered_by?: string;
  first_name?: string;
  last_name?: string;
  patient_number?: string;
  phone?: string;
}

export interface Vitals {
  id?: string;
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
}

export interface VARecord {
  id?: string;
  visit_id: string;
  va_right_unaided?: string;
  va_left_unaided?: string;
  va_right_aided?: string;
  va_left_aided?: string;
  va_right_ph?: string;
  va_left_ph?: string;
  iop_right?: string;
  iop_left?: string;
  iop_method?: string;
  colour_vision_right?: string;
  colour_vision_left?: string;
  confrontation_vf?: string;
  cover_test?: string;
  motility?: string;
  pupil_right?: string;
  pupil_left?: string;
  notes?: string;
}

export interface QueueItem {
  id: string;
  visit_id: string;
  patient_id: string;
  tally_number: number;
  department: string;
  status: string;
  queue_date: string;
  first_name?: string;
  last_name?: string;
  patient_number?: string;
  visit_status?: string;
  is_express?: boolean;
  chief_complaint?: string;
}

export interface Payment {
  id?: string;
  visit_id: string;
  type: string;
  amount: number;
  method: string;
  hmo_name?: string;
  hmo_auth?: string;
  receipt_no?: string;
  status?: string;
}

export interface Prescription {
  id?: string;
  visit_id: string;
  drug_name: string;
  dosage?: string;
  frequency?: string;
  duration?: string;
  route?: string;
  eye_side?: string;
  quantity?: string;
  instructions?: string;
  dispensed?: boolean;
  dispensed_at?: string;
  first_name?: string;
  last_name?: string;
  tally_number?: string;
}

export interface Scan {
  id?: string;
  visit_id: string;
  scan_type: string;
  image_url?: string;
  findings?: string;
  first_name?: string;
  last_name?: string;
  tally_number?: string;
}

export interface Surgery {
  id?: string;
  visit_id: string;
  surgery_type: string;
  anaesthesia_type?: string;
  duration_min?: number;
  iol_brand?: string;
  iol_model?: string;
  iol_power?: number;
  iol_position?: string;
  technique_notes?: string;
  complications?: string;
  post_op_va_re?: string;
  post_op_va_le?: string;
  bscan_url?: string;
}
