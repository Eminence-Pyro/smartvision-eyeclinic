import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { query } from "@/lib/db";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const dept = req.nextUrl.searchParams.get("department");
  const date = req.nextUrl.searchParams.get("date");
  let sql = `SELECT q.*, pt.first_name, pt.last_name, pt.patient_number, v.status as visit_status, v.is_express, v.chief_complaint
             FROM queue q JOIN patients pt ON pt.id=q.patient_id JOIN visits v ON v.id=q.visit_id WHERE 1=1`;
  const params: unknown[] = [];
  if (dept) { params.push(dept); sql += ` AND q.department=$${params.length}`; }
  if (date === "today") { sql += " AND q.queue_date=CURRENT_DATE"; }
  sql += " ORDER BY q.tally_number";
  const rows = await query(sql, params);
  return NextResponse.json({ queue: rows });
}
