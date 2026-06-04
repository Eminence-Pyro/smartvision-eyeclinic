import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { query } from "@/lib/db";
import { calcBMI } from "@/lib/utils";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { visit_id, weight_kg, height_cm, bp_systolic, bp_diastolic,
          pulse_bpm, temperature_c, spo2_percent, blood_sugar, notes } = body;

  if (!visit_id) return NextResponse.json({ error: "visit_id required" }, { status: 400 });

  const bmi = weight_kg && height_cm ? calcBMI(weight_kg, height_cm) : null;
  const staffId = (session.user as { id: string }).id;

  await query(
    `INSERT INTO vitals
     (visit_id, weight_kg, height_cm, bmi, bp_systolic, bp_diastolic,
      pulse_bpm, temperature_c, spo2_percent, blood_sugar, notes, recorded_by)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
     ON CONFLICT (visit_id) DO UPDATE SET
       weight_kg=$2, height_cm=$3, bmi=$4, bp_systolic=$5, bp_diastolic=$6,
       pulse_bpm=$7, temperature_c=$8, spo2_percent=$9, blood_sugar=$10,
       notes=$11, recorded_by=$12, recorded_at=NOW()`,
    [visit_id, weight_kg||null, height_cm||null, bmi,
     bp_systolic||null, bp_diastolic||null, pulse_bpm||null,
     temperature_c||null, spo2_percent||null, blood_sugar||null,
     notes||null, staffId]
  );

  // Advance visit status
  await query(
    "UPDATE visits SET status = 'awaiting_payment', updated_at = NOW() WHERE id = $1",
    [visit_id]
  );

  return NextResponse.json({ message: "Vitals saved." }, { status: 201 });
}
