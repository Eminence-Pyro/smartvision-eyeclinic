import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { query } from "@/lib/db";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const patientId = (session.user as { id: string }).id;
  const rows = await query(
    `SELECT p.*, v.visit_date FROM prescriptions p
     JOIN visits v ON v.id=p.visit_id
     WHERE v.patient_id=$1 ORDER BY p.created_at DESC LIMIT 30`,
    [patientId]
  );
  return NextResponse.json({ prescriptions: rows });
}
