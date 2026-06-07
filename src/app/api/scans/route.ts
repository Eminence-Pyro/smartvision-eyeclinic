import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { query } from "@/lib/db";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { visit_id, scan_type, eye_side, indication } = body;
  if (!visit_id || !scan_type) {
    return NextResponse.json({ error: "visit_id and scan_type required" }, { status: 400 });
  }

  const [scan] = await query<{ id: string }>(
    `INSERT INTO scans (visit_id, scan_type, eye_side, indication, performed_by)
     VALUES ($1,$2,$3,$4,$5) RETURNING id`,
    [visit_id, scan_type, eye_side || null, indication || null, (session.user as { id: string }).id]
  );

  // Advance visit to scan_booked
  await query("UPDATE visits SET status='scan_booked', updated_at=NOW() WHERE id=$1", [visit_id]);

  return NextResponse.json({ scan_id: scan.id, message: "Scan booked." }, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { scan_id, findings, image_urls } = body;
  if (!scan_id) return NextResponse.json({ error: "scan_id required" }, { status: 400 });

  await query(
    `UPDATE scans SET findings=$1, image_urls=$2, performed_by=$3 WHERE id=$4`,
    [findings || null, image_urls || [], (session.user as { id: string }).id, scan_id]
  );

  // Get visit_id then advance to scan_done
  const rows = await query<{ visit_id: string }>("SELECT visit_id FROM scans WHERE id=$1", [scan_id]);
  if (rows[0]) {
    await query("UPDATE visits SET status='scan_done', updated_at=NOW() WHERE id=$1", [rows[0].visit_id]);
  }

  return NextResponse.json({ message: "Scan updated." });
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const statusP  = req.nextUrl.searchParams.get("status");
  const visitId  = req.nextUrl.searchParams.get("visit_id");
  const dateP    = req.nextUrl.searchParams.get("date");

  const params: unknown[] = [];
  const conds: string[]   = ["1=1"];

  if (visitId) { params.push(visitId); conds.push(`s.visit_id=$${params.length}`); }
  if (statusP === "booked") { conds.push("s.findings IS NULL"); }
  if (statusP === "done")   { conds.push("s.findings IS NOT NULL"); }
  if (dateP === "today")    { conds.push("v.visit_date=CURRENT_DATE"); }

  const rows = await query(
    `SELECT s.*, pt.first_name, pt.last_name, pt.patient_number, v.tally_number
     FROM scans s
     JOIN visits v ON v.id=s.visit_id
     JOIN patients pt ON pt.id=v.patient_id
     WHERE ${conds.join(" AND ")}
     ORDER BY s.created_at DESC`,
    params
  );
  return NextResponse.json({ scans: rows });
}
