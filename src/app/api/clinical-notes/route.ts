import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { query } from "@/lib/db";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { visit_id, ...fields } = body;
  if (!visit_id) return NextResponse.json({ error: "visit_id required" }, { status: 400 });

  const doctorId = (session.user as { id: string }).id;

  await query(
    `INSERT INTO clinical_notes
     (visit_id, history_presenting_complaint, past_ocular_history, past_medical_history,
      family_history, drug_history, social_history,
      anterior_segment_right, anterior_segment_left,
      posterior_segment_right, posterior_segment_left,
      diagnosis_right, diagnosis_left, icd_codes,
      management_plan, follow_up_date, doctor_id)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17)
     ON CONFLICT (visit_id) DO UPDATE SET
       history_presenting_complaint=$2, past_ocular_history=$3, past_medical_history=$4,
       family_history=$5, drug_history=$6, social_history=$7,
       anterior_segment_right=$8, anterior_segment_left=$9,
       posterior_segment_right=$10, posterior_segment_left=$11,
       diagnosis_right=$12, diagnosis_left=$13, icd_codes=$14,
       management_plan=$15, follow_up_date=$16, doctor_id=$17, updated_at=NOW()`,
    [
      visit_id,
      fields.history_presenting_complaint || null,
      fields.past_ocular_history || null,
      fields.past_medical_history || null,
      fields.family_history || null,
      fields.drug_history || null,
      fields.social_history || null,
      fields.anterior_segment_right || null,
      fields.anterior_segment_left || null,
      fields.posterior_segment_right || null,
      fields.posterior_segment_left || null,
      fields.diagnosis_right || null,
      fields.diagnosis_left || null,
      fields.icd_codes || null,
      fields.management_plan || null,
      fields.follow_up_date || null,
      doctorId,
    ]
  );

  // Advance visit to with_doctor
  await query(
    "UPDATE visits SET status='with_doctor', updated_at=NOW() WHERE id=$1",
    [visit_id]
  );

  return NextResponse.json({ message: "Clinical notes saved." });
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const visitId = req.nextUrl.searchParams.get("visit_id");
  if (!visitId) return NextResponse.json({ error: "visit_id required" }, { status: 400 });
  const rows = await query(
    "SELECT * FROM clinical_notes WHERE visit_id=$1 LIMIT 1", [visitId]
  );
  return NextResponse.json({ notes: rows[0] || null });
}
