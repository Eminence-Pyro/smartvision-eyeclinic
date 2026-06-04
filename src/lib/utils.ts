import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, formatDistanceToNow } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date | null | undefined, fmt = "dd MMM yyyy"): string {
  if (!date) return "—";
  try { return format(new Date(date), fmt); }
  catch { return "—"; }
}

export function formatDateTime(date: string | Date | null | undefined): string {
  return formatDate(date, "dd MMM yyyy HH:mm");
}

export function timeAgo(date: string | Date): string {
  try { return formatDistanceToNow(new Date(date), { addSuffix: true }); }
  catch { return "—"; }
}

export function formatCurrency(amount: number, currency = "NGN"): string {
  return new Intl.NumberFormat("en-NG", {
    style: "currency", currency, minimumFractionDigits: 2
  }).format(amount);
}

export function calcBMI(weight_kg: number, height_cm: number): number {
  const h = height_cm / 100;
  return Math.round((weight_kg / (h * h)) * 10) / 10;
}

export function bmiCategory(bmi: number): string {
  if (bmi < 18.5) return "Underweight";
  if (bmi < 25)   return "Normal";
  if (bmi < 30)   return "Overweight";
  return "Obese";
}

export function getInitials(name: string): string {
  return name.split(" ").slice(0, 2).map(n => n[0]?.toUpperCase()).join("");
}

export const VISIT_STATUS_LABELS: Record<string, string> = {
  registered:           "Registered",
  awaiting_payment:     "Awaiting Payment",
  vision_assessment:    "Vision Assessment",
  awaiting_doctor:      "Awaiting Doctor",
  with_doctor:          "With Doctor",
  awaiting_scan_payment:"Awaiting Scan Payment",
  scan_booked:          "Scan Booked",
  scan_done:            "Scan Done",
  awaiting_surgery:     "Awaiting Surgery",
  surgery_booked:       "Surgery Booked",
  pharmacy:             "At Pharmacy",
  completed:            "Completed",
  cancelled:            "Cancelled",
};

export const VISIT_STATUS_COLORS: Record<string, string> = {
  registered:        "bg-blue-100 text-blue-700",
  awaiting_payment:  "bg-yellow-100 text-yellow-700",
  vision_assessment: "bg-purple-100 text-purple-700",
  awaiting_doctor:   "bg-orange-100 text-orange-700",
  with_doctor:       "bg-green-100 text-green-700",
  completed:         "bg-gray-100 text-gray-600",
  cancelled:         "bg-red-100 text-red-700",
};

export const SCAN_TYPE_LABELS: Record<string, string> = {
  fundus_photo: "Fundus Photography",
  oct_macular:  "OCT Macular",
  oct_disc:     "OCT Disc",
  gonioscopy:   "Gonioscopy",
  pachymetry:   "Pachymetry",
  b_scan:       "B-Scan",
  visual_field: "Visual Field",
  topography:   "Corneal Topography",
  other:        "Other",
};

export const SURGERY_TYPE_LABELS: Record<string, string> = {
  phacoemulsification: "Phacoemulsification",
  glaucoma_surgery:    "Glaucoma Surgery",
  trabeculectomy:      "Trabeculectomy",
  vitrectomy:          "Vitrectomy",
  pterygium:           "Pterygium Surgery",
  enucleation:         "Enucleation",
  evisceration:        "Evisceration",
  lid_surgery:         "Lid Surgery",
  squint_surgery:      "Squint Surgery",
  dce:                 "DCE",
  other:               "Other",
};
