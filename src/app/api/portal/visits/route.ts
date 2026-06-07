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
  const limit     = parseInt(req.nextUrl.searchParams.get("limit") || "20");
  const offset    = parseInt(req.nextUrl.searchParams.get("offset") || "0");

  const rows = await query(
    `SELECT v.id, v.tally_number, v.visit_date, v.status, v.is_express,
            v.chief_complaint, v.created_at
     FROM visits v
     WHERE v.patient_id=$1
     ORDER BY v.visit_date DESC, v.created_at DESC
     LIMIT $2 OFFSET $3`,
    [patientId, limit, offset]
  );
  return NextResponse.json({ visits: rows });
}
