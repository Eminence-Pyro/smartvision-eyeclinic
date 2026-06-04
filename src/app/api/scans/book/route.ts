import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { query } from "@/lib/db";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const { visit_id, patient_id, type, eye_side, indication } = body;
  if (!visit_id || !patient_id || !type) return NextResponse.json({ error: "Required fields missing" }, { status: 400 });
  const [scan] = await query<{ id: string }>(
    "INSERT INTO scans (visit_id, type, eye_side, indication) VALUES ($1,$2,$3,$4) RETURNING id",
    [visit_id, type, eye_side||"both", indication||null]
  );
  await query("UPDATE visits SET status='awaiting_scan_payment', updated_at=NOW() WHERE id=$1", [visit_id]);
  return NextResponse.json({ scan_id: scan.id }, { status: 201 });
}
