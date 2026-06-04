import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { query } from "@/lib/db";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const status = req.nextUrl.searchParams.get("status");
  const visit_id = req.nextUrl.searchParams.get("visit_id");
  let sql = `SELECT s.*, pt.first_name, pt.last_name, pt.patient_number, v.tally_number
             FROM scans s JOIN visits v ON v.id=s.visit_id JOIN patients pt ON pt.id=v.patient_id WHERE 1=1`;
  const params: unknown[] = [];
  if (visit_id) { params.push(visit_id); sql += ` AND s.visit_id=$${params.length}`; }
  if (status === "booked") { sql += " AND s.findings IS NULL"; }
  if (req.nextUrl.searchParams.get("date") === "today") { sql += " AND v.visit_date=CURRENT_DATE"; }
  sql += " ORDER BY s.created_at DESC";
  const rows = await query(sql, params);
  return NextResponse.json({ scans: rows });
}
