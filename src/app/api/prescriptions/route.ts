import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { query } from "@/lib/db";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { visit_id, prescriptions } = await req.json();
  if (!visit_id || !prescriptions?.length) return NextResponse.json({ error: "visit_id and prescriptions required" }, { status: 400 });
  const doctorId = (session.user as { id: string }).id;
  for (const rx of prescriptions) {
    await query(
      `INSERT INTO prescriptions (visit_id, drug_name, dosage, frequency, duration, route, eye_side, instructions, quantity, prescribed_by)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
      [visit_id, rx.drug_name, rx.dosage||null, rx.frequency||null, rx.duration||null,
       rx.route||null, rx.eye_side||null, rx.instructions||null, rx.quantity||null, doctorId]
    );
  }
  await query("UPDATE visits SET status='pharmacy', updated_at=NOW() WHERE id=$1", [visit_id]);
  return NextResponse.json({ message: "Prescriptions saved." }, { status: 201 });
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const visit_id = req.nextUrl.searchParams.get("visit_id");
  const date     = req.nextUrl.searchParams.get("date");
  const dispensed = req.nextUrl.searchParams.get("dispensed");
  let sql = `SELECT p.*, pt.first_name, pt.last_name, pt.patient_number,
             v.tally_number FROM prescriptions p
             JOIN visits v ON v.id=p.visit_id
             JOIN patients pt ON pt.id=v.patient_id WHERE 1=1`;
  const params: unknown[] = [];
  if (visit_id)           { params.push(visit_id); sql += ` AND p.visit_id=$${params.length}`; }
  if (date === "today")   { sql += " AND v.visit_date=CURRENT_DATE"; }
  if (dispensed === "false") { sql += " AND p.dispensed=FALSE"; }
  sql += " ORDER BY p.created_at";
  const rows = await query(sql, params);
  return NextResponse.json({ prescriptions: rows });
}
