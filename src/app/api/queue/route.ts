import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { query } from "@/lib/db";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const dept   = req.nextUrl.searchParams.get("department");
  const date   = req.nextUrl.searchParams.get("date");
  const status = req.nextUrl.searchParams.get("status");

  const params: unknown[] = [];
  const conds: string[]   = ["1=1"];

  if (dept)   { params.push(dept);   conds.push(`q.department=$${params.length}`); }
  if (status) { params.push(status); conds.push(`q.status=$${params.length}`); }
  if (date === "today") { conds.push("q.queue_date=CURRENT_DATE"); }

  const rows = await query(
    `SELECT q.*,
            pt.first_name, pt.last_name, pt.patient_number,
            v.status as visit_status, v.is_express, v.chief_complaint
     FROM queue q
     JOIN patients pt ON pt.id=q.patient_id
     JOIN visits v ON v.id=q.visit_id
     WHERE ${conds.join(" AND ")}
     ORDER BY v.is_express DESC, q.tally_number ASC`,
    params
  );
  return NextResponse.json({ queue: rows });
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { queue_id, status, department } = await req.json();
  if (!queue_id) return NextResponse.json({ error: "queue_id required" }, { status: 400 });

  const updates: string[] = [];
  const params: unknown[] = [];

  if (status) {
    params.push(status); updates.push(`status=$${params.length}`);
    if (status === "called")   { updates.push("called_at=NOW()"); }
    if (status === "done")     { updates.push("done_at=NOW()"); }
  }
  if (department) { params.push(department); updates.push(`department=$${params.length}`); }

  if (!updates.length) return NextResponse.json({ error: "Nothing to update" }, { status: 400 });

  params.push(queue_id);
  await query(`UPDATE queue SET ${updates.join(",")} WHERE id=$${params.length}`, params);

  return NextResponse.json({ message: "Queue updated." });
}
