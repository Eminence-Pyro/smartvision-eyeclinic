import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { query } from "@/lib/db";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const patientId = (session.user as { id: string }).id;
  const rows = await query(
    `SELECT rx.id, rx.drug_name, rx.dosage, rx.frequency, rx.duration,
            rx.route, rx.eye_side, rx.quantity, rx.instructions,
            rx.dispensed, rx.dispensed_at, rx.created_at,
            v.visit_date, v.tally_number
     FROM prescriptions rx
     JOIN visits v ON v.id = rx.visit_id
     WHERE v.patient_id=$1
     ORDER BY rx.created_at DESC
     LIMIT 50`,
    [patientId]
  );
  return NextResponse.json({ prescriptions: rows });
}
