import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { query } from "@/lib/db";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const { visit_id, patient_id, type, eye_side, indication, preop_notes } = body;
  if (!visit_id || !type || !eye_side) return NextResponse.json({ error: "Required fields missing" }, { status: 400 });
  const [surg] = await query<{ id: string }>(
    "INSERT INTO surgeries (visit_id, type, eye_side, indication, preop_notes) VALUES ($1,$2,$3,$4,$5) RETURNING id",
    [visit_id, type, eye_side, indication||null, preop_notes||null]
  );
  await query("UPDATE visits SET status='awaiting_surgery', updated_at=NOW() WHERE id=$1", [visit_id]);
  return NextResponse.json({ surgery_id: surg.id }, { status: 201 });
}
