import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { query } from "@/lib/db";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body     = await req.json();
  const { visit_id, ...fields } = body;
  if (!visit_id) return NextResponse.json({ error: "visit_id required" }, { status: 400 });

  const staffId = (session.user as { id: string }).id;
  const cols    = Object.keys(fields).concat(["visit_id", "recorded_by"]);
  const vals    = Object.values(fields).concat([visit_id, staffId]);
  const placeholders = vals.map((_, i) => `$${i + 1}`).join(", ");
  const updates = Object.keys(fields).map(k => `${k} = EXCLUDED.${k}`).join(", ");

  await query(
    `INSERT INTO vision_assessments (${cols.join(", ")})
     VALUES (${placeholders})
     ON CONFLICT (visit_id) DO UPDATE SET ${updates}, recorded_at = NOW()`,
    vals
  );

  await query(
    "UPDATE visits SET status = 'awaiting_doctor', updated_at = NOW() WHERE id = $1",
    [visit_id]
  );

  return NextResponse.json({ message: "Vision assessment saved." }, { status: 201 });
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const visit_id = req.nextUrl.searchParams.get("visit_id");
  if (!visit_id) return NextResponse.json({ error: "visit_id required" }, { status: 400 });

  const rows = await query("SELECT * FROM vision_assessments WHERE visit_id = $1", [visit_id]);
  return NextResponse.json({ assessment: rows[0] || null });
}
