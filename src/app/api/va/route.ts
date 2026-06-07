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

  const staffId = (session.user as { id: string }).id;

  await query(
    `INSERT INTO va_records
     (visit_id, va_right_unaided, va_left_unaided, va_right_aided, va_left_aided,
      va_right_ph, va_left_ph, iop_right, iop_left, iop_method,
      colour_vision_right, colour_vision_left, confrontation_vf,
      cover_test, motility, pupil_right, pupil_left, notes, recorded_by)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19)
     ON CONFLICT (visit_id) DO UPDATE SET
       va_right_unaided=$2, va_left_unaided=$3, va_right_aided=$4, va_left_aided=$5,
       va_right_ph=$6, va_left_ph=$7, iop_right=$8, iop_left=$9, iop_method=$10,
       colour_vision_right=$11, colour_vision_left=$12, confrontation_vf=$13,
       cover_test=$14, motility=$15, pupil_right=$16, pupil_left=$17,
       notes=$18, recorded_by=$19`,
    [visit_id,
     fields.va_right_unaided||null, fields.va_left_unaided||null,
     fields.va_right_aided||null,   fields.va_left_aided||null,
     fields.va_right_ph||null,      fields.va_left_ph||null,
     fields.iop_right||null,        fields.iop_left||null,
     fields.iop_method||"NCT",
     fields.colour_vision_right||null, fields.colour_vision_left||null,
     fields.confrontation_vf||null, fields.cover_test||null,
     fields.motility||null, fields.pupil_right||null, fields.pupil_left||null,
     fields.notes||null, staffId]
  );

  // Advance visit status to awaiting_doctor
  await query(
    "UPDATE visits SET status='awaiting_doctor', updated_at=NOW() WHERE id=$1",
    [visit_id]
  );

  return NextResponse.json({ message: "VA record saved." });
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const visitId = req.nextUrl.searchParams.get("visit_id");
  if (!visitId) return NextResponse.json({ error: "visit_id required" }, { status: 400 });
  const rows = await query("SELECT * FROM va_records WHERE visit_id=$1 LIMIT 1", [visitId]);
  return NextResponse.json({ va: rows[0] || null });
}
