import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { query } from "@/lib/db";
import { generatePatientNumber } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const {
      first_name, last_name, middle_name, date_of_birth, gender, phone, email,
      address, state_of_origin, occupation, next_of_kin, next_of_kin_phone,
      blood_group, genotype, allergies, hmo_name, hmo_number,
      chief_complaint, is_express
    } = body;

    if (!first_name?.trim() || !last_name?.trim()) {
      return NextResponse.json({ error: "First and last name are required." }, { status: 400 });
    }

    // Check for duplicate email only if email is provided
    if (email?.trim()) {
      const existing = await query(
        "SELECT id FROM patients WHERE email = $1 LIMIT 1",
        [email.toLowerCase().trim()]
      );
      if (existing.length) {
        return NextResponse.json({ error: "A patient with this email already exists." }, { status: 409 });
      }
    }

    const patient_number = await generatePatientNumber();

    const [patient] = await query<{ id: string }>(
      `INSERT INTO patients
       (first_name, last_name, middle_name, date_of_birth, gender, phone, email,
        address, state_of_origin, occupation, next_of_kin, next_of_kin_phone,
        blood_group, genotype, allergies, hmo_name, hmo_number, patient_number)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18)
       RETURNING id`,
      [
        first_name.trim(), last_name.trim(),
        middle_name?.trim() || null,
        date_of_birth || null,
        gender || null,
        phone?.trim() || null,
        email?.toLowerCase().trim() || null,
        address?.trim() || null,
        state_of_origin?.trim() || null,
        occupation?.trim() || null,
        next_of_kin?.trim() || null,
        next_of_kin_phone?.trim() || null,
        blood_group || null,
        genotype || null,
        allergies?.trim() || null,
        hmo_name?.trim() || null,
        hmo_number?.trim() || null,
        patient_number,
      ]
    );

    // Create today's visit with tally number
    const staffId = (session.user as { id: string }).id;
    const tallyRes = await query<{ count: string }>(
      "SELECT COUNT(*) as count FROM visits WHERE visit_date = CURRENT_DATE"
    );
    const tallyNum = parseInt(tallyRes[0]?.count || "0") + 1;
    const tally    = tallyNum.toString().padStart(3, "0");

    const [visit] = await query<{ id: string }>(
      `INSERT INTO visits (patient_id, tally_number, chief_complaint, is_express, registered_by)
       VALUES ($1,$2,$3,$4,$5) RETURNING id`,
      [patient.id, tally, chief_complaint?.trim() || null, is_express || false, staffId]
    );

    // Add to queue
    await query(
      `INSERT INTO queue (visit_id, patient_id, tally_number, department, queue_date)
       VALUES ($1,$2,$3,$4,CURRENT_DATE)`,
      [visit.id, patient.id, tallyNum, "front_desk"]
    );

    return NextResponse.json(
      { patient_number, visit_id: visit.id, tally_number: tally },
      { status: 201 }
    );
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    console.error("staff-register error:", msg);
    return NextResponse.json({ error: "Registration failed: " + msg }, { status: 500 });
  }
}
