import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { hashPassword, generatePatientNumber } from "@/lib/auth";
import { z } from "zod";

const RegisterSchema = z.object({
  first_name:     z.string().min(1).max(100),
  last_name:      z.string().min(1).max(100),
  email:          z.string().email(),
  phone:          z.string().optional(),
  date_of_birth:  z.string().optional(),
  gender:         z.string().optional(),
  password:       z.string().min(8),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = RegisterSchema.parse(body);

    // Check email uniqueness
    const existing = await query("SELECT id FROM patients WHERE email = $1 LIMIT 1", [data.email.toLowerCase()]);
    if (existing.length) return NextResponse.json({ error: "Email already registered." }, { status: 409 });

    const password_hash    = await hashPassword(data.password);
    const patient_number   = await generatePatientNumber();

    await query(
      `INSERT INTO patients
       (first_name, last_name, email, phone, date_of_birth, gender, password_hash, patient_number)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
      [
        data.first_name, data.last_name,
        data.email.toLowerCase(), data.phone || null,
        data.date_of_birth || null, data.gender || null,
        password_hash, patient_number,
      ]
    );

    return NextResponse.json({ message: "Account created.", patient_number }, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) return NextResponse.json({ error: err.errors[0].message }, { status: 400 });
    console.error(err);
    return NextResponse.json({ error: "Server error." }, { status: 500 });
  }
}
