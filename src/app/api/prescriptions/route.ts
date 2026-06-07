import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { query } from "@/lib/db";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { visit_id, prescriptions } = await req.json();
  if (!visit_id || !prescriptions?.length) {
    return NextResponse.json({ error: "visit_id and prescriptions required" }, { status: 400 });
  }

  const doctorId = (session.user as { id: string }).id;

  for (const rx of prescriptions) {
    if (!rx.drug_name?.trim()) continue;
    await query(
      `INSERT INTO prescriptions
       (visit_id, drug_name, dosage, frequency, duration, route, eye_side, quantity, instructions, dispensed)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,FALSE)`,
      [visit_id, rx.drug_name.trim(), rx.dosage||null, rx.frequency||null,
       rx.duration||null, rx.route||null, rx.eye_side||null,
       rx.quantity||null, rx.instructions||null]
    );
  }

  // Advance visit to pharmacy
  await query(
    "UPDATE visits SET status='pharmacy', updated_at=NOW() WHERE id=$1",
    [visit_id]
  );

  return NextResponse.json({ message: "Prescriptions saved." }, { status: 201 });
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const dateParam      = req.nextUrl.searchParams.get("date");
  const dispensedParam = req.nextUrl.searchParams.get("dispensed");
  const visitId        = req.nextUrl.searchParams.get("visit_id");

  const params: unknown[] = [];
  const conditions: string[] = ["1=1"];

  if (dateParam === "today") {
    conditions.push("v.visit_date = CURRENT_DATE");
  }
  if (dispensedParam === "false") {
    conditions.push("rx.dispensed = FALSE");
  } else if (dispensedParam === "true") {
    conditions.push("rx.dispensed = TRUE");
  }
  if (visitId) {
    params.push(visitId);
    conditions.push(`rx.visit_id = $${params.length}`);
  }

  const rows = await query(
    `SELECT rx.*,
            p.first_name, p.last_name, p.patient_number,
            v.tally_number,
            COALESCE(s.first_name || ' ' || s.last_name, 'Doctor') as prescribed_by_name
     FROM prescriptions rx
     JOIN visits v ON v.id = rx.visit_id
     JOIN patients p ON p.id = v.patient_id
     LEFT JOIN staff s ON s.id = v.registered_by
     WHERE ${conditions.join(" AND ")}
     ORDER BY rx.dispensed ASC, v.tally_number ASC`,
    params
  );
  return NextResponse.json({ prescriptions: rows });
}
