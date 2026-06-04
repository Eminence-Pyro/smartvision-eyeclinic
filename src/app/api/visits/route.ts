import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { query } from "@/lib/db";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { patient_id, chief_complaint, is_express } = await req.json();
  if (!patient_id) return NextResponse.json({ error: "patient_id required" }, { status: 400 });

  const staffId = (session.user as { id: string }).id;
  const tallyRes = await query<{ count: string }>(
    "SELECT COUNT(*) as count FROM visits WHERE visit_date = CURRENT_DATE"
  );
  const tallyNum = parseInt(tallyRes[0]?.count || "0") + 1;
  const tally    = tallyNum.toString().padStart(3, "0");

  const [visit] = await query<{ id: string }>(
    `INSERT INTO visits (patient_id, tally_number, chief_complaint, is_express, registered_by)
     VALUES ($1,$2,$3,$4,$5) RETURNING id`,
    [patient_id, tally, chief_complaint||null, is_express||false, staffId]
  );

  await query(
    "INSERT INTO queue (visit_id, patient_id, tally_number, department) VALUES ($1,$2,$3,$4)",
    [visit.id, patient_id, tallyNum, "front_desk"]
  );

  return NextResponse.json({ visit_id: visit.id, tally_number: tally }, { status: 201 });
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const date   = req.nextUrl.searchParams.get("date") || "today";
  const status = req.nextUrl.searchParams.get("status");
  const pid    = req.nextUrl.searchParams.get("patient_id");

  let sql = `
    SELECT v.*, p.first_name, p.last_name, p.patient_number, p.phone
    FROM visits v JOIN patients p ON p.id = v.patient_id
    WHERE 1=1
  `;
  const params: unknown[] = [];

  if (date === "today") {
    params.push(1); sql += ` AND v.visit_date = CURRENT_DATE`;
  }
  if (status) { params.push(status); sql += ` AND v.status = $${params.length}`; }
  if (pid)    { params.push(pid);    sql += ` AND v.patient_id = $${params.length}`; }

  sql += " ORDER BY v.created_at DESC LIMIT 100";

  const rows = await query(sql, params);
  return NextResponse.json({ visits: rows });
}
