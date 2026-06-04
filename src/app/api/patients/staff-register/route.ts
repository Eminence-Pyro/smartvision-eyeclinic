import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { query } from "@/lib/db";
import { generatePatientNumber } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { first_name, last_name, middle_name, date_of_birth, gender, phone, email,
          address, occupation, next_of_kin, next_of_kin_phone,
          blood_group, genotype, allergies, hmo_name, hmo_number,
          chief_complaint, is_express } = body;

  if (!first_name || !last_name) return NextResponse.json({ error: "Name is required." }, { status: 400 });

  const patient_number = await generatePatientNumber();

  const [patient] = await query<{ id: string }>(
    `INSERT INTO patients
     (first_name, last_name, middle_name, date_of_birth, gender, phone, email,
      address, occupation, next_of_kin, next_of_kin_phone,
      blood_group, genotype, allergies, hmo_name, hmo_number, patient_number)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17)
     RETURNING id`,
    [first_name, last_name, middle_name||null, date_of_birth||null, gender||null,
     phone||null, email?.toLowerCase()||null, address||null, occupation||null,
     next_of_kin||null, next_of_kin_phone||null, blood_group||null, genotype||null,
     allergies||null, hmo_name||null, hmo_number||null, patient_number]
  );

  // Create today's visit + tally number
  const staffId = (session.user as { id: string }).id;
  const tallyRes = await query<{ count: string }>(
    "SELECT COUNT(*) as count FROM visits WHERE visit_date = CURRENT_DATE"
  );
  const tally = (parseInt(tallyRes[0]?.count || "0") + 1).toString().padStart(3, "0");

  const [visit] = await query<{ id: string }>(
    `INSERT INTO visits (patient_id, tally_number, chief_complaint, is_express, registered_by)
     VALUES ($1,$2,$3,$4,$5) RETURNING id`,
    [patient.id, tally, chief_complaint||null, is_express||false, staffId]
  );

  // Add to queue
  await query(
    `INSERT INTO queue (visit_id, patient_id, tally_number, department)
     VALUES ($1,$2,$3,$4)`,
    [visit.id, patient.id, parseInt(tally), "front_desk"]
  );

  return NextResponse.json({ patient_number, visit_id: visit.id, tally_number: tally }, { status: 201 });
}
