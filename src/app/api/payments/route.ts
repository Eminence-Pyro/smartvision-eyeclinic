import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { query } from "@/lib/db";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { visit_id, patient_id, type, description, amount, method, hmo_name, hmo_auth_code, notes } = body;

  if (!visit_id || !patient_id || !type || !amount) {
    return NextResponse.json({ error: "visit_id, patient_id, type, amount required" }, { status: 400 });
  }

  const staffId  = (session.user as { id: string }).id;
  const receipt  = `REC/${Date.now().toString().slice(-8)}`;

  const [pmt] = await query<{ id: string }>(
    `INSERT INTO payments
     (visit_id, patient_id, type, description, amount, method, status,
      receipt_number, hmo_name, hmo_auth_code, notes, recorded_by, paid_at)
     VALUES ($1,$2,$3,$4,$5,$6,'paid',$7,$8,$9,$10,$11,NOW())
     RETURNING id`,
    [visit_id, patient_id, type, description||null, amount,
     method||null, receipt, hmo_name||null, hmo_auth_code||null, notes||null, staffId]
  );

  // Advance visit status based on payment type
  const statusMap: Record<string, string> = {
    consultation:    "vision_assessment",
    express_service: "vision_assessment",
    scan:            "scan_booked",
    surgery:         "surgery_booked",
  };
  const nextStatus = statusMap[type];
  if (nextStatus) {
    await query("UPDATE visits SET status = $1, updated_at = NOW() WHERE id = $2", [nextStatus, visit_id]);
  }

  return NextResponse.json({ payment_id: pmt.id, receipt_number: receipt }, { status: 201 });
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const visit_id = req.nextUrl.searchParams.get("visit_id");
  const patient_id = req.nextUrl.searchParams.get("patient_id");

  let sql = "SELECT * FROM payments WHERE 1=1";
  const params: unknown[] = [];
  if (visit_id)   { params.push(visit_id);   sql += ` AND visit_id = $${params.length}`; }
  if (patient_id) { params.push(patient_id); sql += ` AND patient_id = $${params.length}`; }
  sql += " ORDER BY created_at DESC";

  const rows = await query(sql, params);
  return NextResponse.json({ payments: rows });
}
