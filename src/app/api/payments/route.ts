import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { query } from "@/lib/db";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const { visit_id, patient_id, type, description, amount, method, hmo_name, hmo_auth_code, notes } = body;
  if (!visit_id || !patient_id || !type || !amount) return NextResponse.json({ error: "Required fields missing." }, { status: 400 });
  const staffId  = (session.user as { id: string }).id;
  const receipt  = `REC/${Date.now().toString().slice(-8)}`;
  const [pmt] = await query<{ id: string }>(
    `INSERT INTO payments (visit_id,patient_id,type,description,amount,method,status,receipt_number,hmo_name,hmo_auth_code,notes,recorded_by,paid_at)
     VALUES ($1,$2,$3,$4,$5,$6,'paid',$7,$8,$9,$10,$11,NOW()) RETURNING id`,
    [visit_id, patient_id, type, description||null, amount, method||null, receipt, hmo_name||null, hmo_auth_code||null, notes||null, staffId]
  );
  const statusMap: Record<string, string> = {
    consultation:"vision_assessment", express_service:"vision_assessment",
    scan:"scan_booked", surgery:"surgery_booked",
  };
  if (statusMap[type]) await query("UPDATE visits SET status=$1, updated_at=NOW() WHERE id=$2", [statusMap[type], visit_id]);
  return NextResponse.json({ payment_id: pmt.id, receipt_number: receipt }, { status: 201 });
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const visit_id = req.nextUrl.searchParams.get("visit_id");
  const date = req.nextUrl.searchParams.get("date");
  let sql = `SELECT p.*, pt.first_name, pt.last_name, v.tally_number FROM payments p
             JOIN visits v ON v.id=p.visit_id JOIN patients pt ON pt.id=p.patient_id WHERE 1=1`;
  const params: unknown[] = [];
  if (visit_id) { params.push(visit_id); sql += ` AND p.visit_id=$${params.length}`; }
  if (date === "today") { sql += " AND v.visit_date=CURRENT_DATE"; }
  sql += " ORDER BY p.created_at DESC";
  return NextResponse.json({ payments: await query(sql, params) });
}
