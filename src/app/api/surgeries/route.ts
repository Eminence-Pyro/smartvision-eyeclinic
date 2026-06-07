import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { query } from "@/lib/db";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { visit_id, surgery_type, eye_side, indication, preop_notes } = body;
  if (!visit_id || !surgery_type) {
    return NextResponse.json({ error: "visit_id and surgery_type required" }, { status: 400 });
  }

  const [surg] = await query<{ id: string }>(
    `INSERT INTO surgeries (visit_id, surgery_type, eye_side, indication, technique_notes, surgeon_id)
     VALUES ($1,$2,$3,$4,$5,$6) RETURNING id`,
    [visit_id, surgery_type, eye_side || null, indication || null,
     preop_notes || null, (session.user as { id: string }).id]
  );

  await query("UPDATE visits SET status='surgery_booked', updated_at=NOW() WHERE id=$1", [visit_id]);

  return NextResponse.json({ surgery_id: surg.id, message: "Surgery booked." }, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { surgery_id, anaesthesia_type, duration_min, iol_brand, iol_model, iol_power, iol_position,
          technique_notes, complications, post_op_va_re, post_op_va_le,
          post_op_iop_re, post_op_iop_le, bscan_urls } = body;

  if (!surgery_id) return NextResponse.json({ error: "surgery_id required" }, { status: 400 });

  await query(
    `UPDATE surgeries SET
      anaesthesia_type=$1, duration_min=$2, iol_brand=$3, iol_model=$4, iol_power=$5,
      iol_position=$6, technique_notes=$7, complications=$8, post_op_va_re=$9, post_op_va_le=$10,
      post_op_iop_re=$11, post_op_iop_le=$12, bscan_urls=$13,
      performed_at=NOW(), surgeon_id=$14
     WHERE id=$15`,
    [anaesthesia_type||null, duration_min||null, iol_brand||null, iol_model||null, iol_power||null,
     iol_position||null, technique_notes||null, complications||null,
     post_op_va_re||null, post_op_va_le||null, post_op_iop_re||null, post_op_iop_le||null,
     bscan_urls||[], (session.user as { id: string }).id, surgery_id]
  );

  const rows = await query<{ visit_id: string }>("SELECT visit_id FROM surgeries WHERE id=$1", [surgery_id]);
  if (rows[0]) {
    await query("UPDATE visits SET status='completed', updated_at=NOW() WHERE id=$1", [rows[0].visit_id]);
  }

  return NextResponse.json({ message: "Surgery record updated." });
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const statusP = req.nextUrl.searchParams.get("status");
  const dateP   = req.nextUrl.searchParams.get("date");

  const params: unknown[] = [];
  const conds: string[]   = ["1=1"];

  if (statusP === "booked") { conds.push("s.performed_at IS NULL"); }
  if (statusP === "done")   { conds.push("s.performed_at IS NOT NULL"); }
  if (dateP === "today")    { conds.push("v.visit_date=CURRENT_DATE"); }

  const rows = await query(
    `SELECT s.*, pt.first_name, pt.last_name, pt.patient_number, v.tally_number
     FROM surgeries s
     JOIN visits v ON v.id=s.visit_id
     JOIN patients pt ON pt.id=v.patient_id
     WHERE ${conds.join(" AND ")}
     ORDER BY s.created_at DESC`,
    params
  );
  return NextResponse.json({ surgeries: rows });
}
