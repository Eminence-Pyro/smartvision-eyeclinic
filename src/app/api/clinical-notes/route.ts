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
  const cols = Object.keys(fields).concat(["visit_id","doctor_id","signed_at"]);
  const vals = Object.values(fields).concat([visit_id, doctorId, new Date().toISOString()]);
  const ph   = vals.map((_, i) => `$${i+1}`).join(",");
  const upd  = Object.keys(fields).map(k => `${k}=EXCLUDED.${k}`).join(",");
  await query(
    `INSERT INTO clinical_notes (${cols.join(",")}) VALUES (${ph})
     ON CONFLICT (visit_id) DO UPDATE SET ${upd}, doctor_id=$${cols.indexOf("doctor_id")+1}, signed_at=NOW(), updated_at=NOW()`,
    vals
  );
  await query("UPDATE visits SET status='with_doctor', updated_at=NOW() WHERE id=$1", [visit_id]);
  return NextResponse.json({ message: "Clinical notes saved." }, { status: 201 });
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const visit_id = req.nextUrl.searchParams.get("visit_id");
  if (!visit_id) return NextResponse.json({ error: "visit_id required" }, { status: 400 });
  const rows = await query("SELECT * FROM clinical_notes WHERE visit_id=$1", [visit_id]);
  return NextResponse.json({ notes: rows[0] || null });
}
