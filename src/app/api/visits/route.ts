import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { query } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { patient_id, chief_complaint, is_express } = await req.json();
    if (!patient_id) return NextResponse.json({ error: "patient_id required" }, { status: 400 });

    const staffId  = (session.user as { id: string }).id;
    const tallyRes = await query<{ count: string }>(
      "SELECT COUNT(*) as count FROM visits WHERE visit_date = CURRENT_DATE"
    );
    const tallyNum = parseInt(tallyRes[0]?.count || "0") + 1;
    const tally    = tallyNum.toString().padStart(3, "0");

    const [visit] = await query<{ id: string }>(
      `INSERT INTO visits (patient_id, tally_number, chief_complaint, is_express, registered_by)
       VALUES ($1,$2,$3,$4,$5) RETURNING id`,
      [patient_id, tally, chief_complaint || null, is_express || false, staffId]
    );

    await query(
      `INSERT INTO queue (visit_id, patient_id, tally_number, department, queue_date)
       VALUES ($1,$2,$3,$4,CURRENT_DATE)`,
      [visit.id, patient_id, tallyNum, "front_desk"]
    );

    return NextResponse.json({ visit_id: visit.id, tally_number: tally }, { status: 201 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    console.error("visits POST error:", msg);
    return NextResponse.json({ error: "Failed to create visit: " + msg }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const dateParam   = req.nextUrl.searchParams.get("date");
  const statusParam = req.nextUrl.searchParams.get("status");
  const pidParam    = req.nextUrl.searchParams.get("patient_id");

  const params: unknown[] = [];
  const conditions: string[] = ["1=1"];

  if (dateParam === "today") {
    conditions.push("v.visit_date = CURRENT_DATE");
  } else if (dateParam) {
    params.push(dateParam);
    conditions.push(`v.visit_date = $${params.length}`);
  }

  if (statusParam) {
    params.push(statusParam);
    conditions.push(`v.status = $${params.length}`);
  }

  if (pidParam) {
    params.push(pidParam);
    conditions.push(`v.patient_id = $${params.length}`);
  }

  const rows = await query(
    `SELECT v.id, v.patient_id, v.tally_number, v.visit_date, v.status,
            v.is_express, v.chief_complaint, v.registered_by,
            p.first_name, p.last_name, p.patient_number, p.phone
     FROM visits v
     JOIN patients p ON p.id = v.patient_id
     WHERE ${conditions.join(" AND ")}
     ORDER BY v.is_express DESC, v.tally_number ASC`,
    params
  );
  return NextResponse.json({ visits: rows });
}
