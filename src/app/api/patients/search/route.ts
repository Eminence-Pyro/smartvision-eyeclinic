import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { query } from "@/lib/db";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const q = req.nextUrl.searchParams.get("q")?.trim();
  if (!q || q.length < 2) return NextResponse.json({ patients: [] });

  const like = `%${q}%`;
  const rows = await query(
    `SELECT id, first_name, last_name, middle_name, patient_number, phone, email, gender, date_of_birth, hmo_name
     FROM patients
     WHERE first_name ILIKE $1 OR last_name ILIKE $1 OR middle_name ILIKE $1
       OR phone ILIKE $1 OR email ILIKE $1 OR patient_number ILIKE $1
     ORDER BY last_name, first_name
     LIMIT 20`,
    [like]
  );
  return NextResponse.json({ patients: rows });
}
