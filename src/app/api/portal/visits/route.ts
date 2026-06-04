import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { query } from "@/lib/db";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const role = (session.user as { role: string }).role;
  if (role !== "patient") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const patientId = (session.user as { id: string }).id;
  const rows = await query(
    `SELECT v.*, COUNT(p.id) as payment_count FROM visits v
     LEFT JOIN payments p ON p.visit_id=v.id
     WHERE v.patient_id=$1 GROUP BY v.id ORDER BY v.visit_date DESC LIMIT 20`,
    [patientId]
  );
  return NextResponse.json({ visits: rows });
}
