import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { query } from "@/lib/db";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const patientId = (session.user as { id: string }).id;
  const visitId   = params.id;

  // Verify this visit belongs to this patient
  const visits = await query(
    "SELECT id FROM visits WHERE id=$1 AND patient_id=$2", [visitId, patientId]
  );
  if (!visits.length) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const [vitals, va, notes, prescriptions, scans] = await Promise.all([
    query("SELECT * FROM vitals WHERE visit_id=$1 LIMIT 1", [visitId]),
    query("SELECT * FROM va_records WHERE visit_id=$1 LIMIT 1", [visitId]),
    query("SELECT * FROM clinical_notes WHERE visit_id=$1 LIMIT 1", [visitId]),
    query("SELECT * FROM prescriptions WHERE visit_id=$1 ORDER BY created_at ASC", [visitId]),
    query("SELECT * FROM scans WHERE visit_id=$1 ORDER BY created_at ASC", [visitId]),
  ]);

  return NextResponse.json({
    vitals:        vitals[0] || null,
    va:            va[0] || null,
    notes:         notes[0] || null,
    prescriptions: prescriptions,
    scans:         scans,
  });
}
