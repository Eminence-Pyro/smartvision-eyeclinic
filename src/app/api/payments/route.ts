import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { query } from "@/lib/db";

const STATUS_AFTER_PAYMENT: Record<string, string> = {
  consultation:    "vision_assessment",
  express_service: "vision_assessment",
  scan:            "scan_booked",
  surgery:         "surgery_booked",
  medication:      "pharmacy",
  other:           "awaiting_payment",
};

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { visit_id, patient_id, type, description, amount, method, hmo_name, hmo_auth, notes } = body;

    if (!visit_id || !patient_id || !type || !amount) {
      return NextResponse.json({ error: "visit_id, patient_id, type, and amount are required." }, { status: 400 });
    }

    const staffId    = (session.user as { id: string }).id;
    const receipt_no = `REC/${Date.now().toString().slice(-8)}`;

    await query(
      `INSERT INTO payments
       (visit_id, patient_id, type, description, amount, method, status, receipt_no, hmo_name, hmo_auth, notes, recorded_by, paid_at)
       VALUES ($1,$2,$3,$4,$5,$6,'paid',$7,$8,$9,$10,$11,NOW())`,
      [visit_id, patient_id, type, description || null, amount, method || null,
       receipt_no, hmo_name || null, hmo_auth || null, notes || null, staffId]
    );

    const nextStatus = STATUS_AFTER_PAYMENT[type] || "vision_assessment";
    await query(
      "UPDATE visits SET status=$1, updated_at=NOW() WHERE id=$2",
      [nextStatus, visit_id]
    );

    return NextResponse.json({ message: "Payment recorded.", receipt_no, next_status: nextStatus }, { status: 201 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    console.error("payments POST:", msg);
    return NextResponse.json({ error: "Failed to record payment: " + msg }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const visitId   = req.nextUrl.searchParams.get("visit_id");
  const patientId = req.nextUrl.searchParams.get("patient_id");
  const dateParam = req.nextUrl.searchParams.get("date");

  const params: unknown[] = [];
  const conds: string[]   = ["1=1"];

  if (visitId)   { params.push(visitId);   conds.push(`py.visit_id=$${params.length}`); }
  if (patientId) { params.push(patientId); conds.push(`py.patient_id=$${params.length}`); }
  if (dateParam === "today") { conds.push("v.visit_date=CURRENT_DATE"); }

  const rows = await query(
    `SELECT py.*, v.tally_number, p.first_name, p.last_name, p.patient_number
     FROM payments py
     JOIN visits v ON v.id=py.visit_id
     JOIN patients p ON p.id=py.patient_id
     WHERE ${conds.join(" AND ")}
     ORDER BY py.created_at DESC`,
    params
  );
  return NextResponse.json({ payments: rows });
}
