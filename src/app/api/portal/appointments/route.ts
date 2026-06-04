import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { query } from "@/lib/db";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const patientId = (session.user as { id: string }).id;
  const rows = await query(
    "SELECT * FROM appointments WHERE patient_id=$1 ORDER BY appointment_date DESC, appointment_time DESC LIMIT 20",
    [patientId]
  );
  return NextResponse.json({ appointments: rows });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const patientId = (session.user as { id: string }).id;
  const { appointment_date, appointment_time, type, reason, is_telemedicine } = await req.json();
  if (!appointment_date || !appointment_time) return NextResponse.json({ error: "Date and time required." }, { status: 400 });
  const [appt] = await query<{ id: string }>(
    `INSERT INTO appointments (patient_id, appointment_date, appointment_time, type, reason, is_telemedicine)
     VALUES ($1,$2,$3,$4,$5,$6) RETURNING id`,
    [patientId, appointment_date, appointment_time, type||"consultation", reason||null, is_telemedicine||false]
  );
  return NextResponse.json({ appointment_id: appt.id }, { status: 201 });
}
