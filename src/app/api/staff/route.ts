import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { query } from "@/lib/db";
import { hashPassword } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const role = (session.user as { role: string }).role;
  if (role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const rows = await query(
    "SELECT id,first_name,last_name,email,phone,role,department,is_active,created_at FROM staff ORDER BY last_name,first_name"
  );
  return NextResponse.json({ staff: rows });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const role = (session.user as { role: string }).role;
  if (role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { first_name, last_name, email, phone, role: staffRole, department, password } = await req.json();
  if (!first_name || !last_name || !email || !staffRole || !password) {
    return NextResponse.json({ error: "All required fields must be filled." }, { status: 400 });
  }
  if (password.length < 8) {
    return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });
  }

  const existing = await query("SELECT id FROM staff WHERE email=$1", [email.toLowerCase()]);
  if (existing.length) return NextResponse.json({ error: "Email already registered." }, { status: 409 });

  const password_hash = await hashPassword(password);
  await query(
    `INSERT INTO staff (first_name, last_name, email, phone, role, department, password_hash, is_active)
     VALUES ($1,$2,$3,$4,$5,$6,$7,TRUE)`,
    [first_name, last_name, email.toLowerCase(), phone||null, staffRole, department||null, password_hash]
  );
  return NextResponse.json({ message: "Staff account created." }, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const role = (session.user as { role: string }).role;
  if (role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id, is_active } = await req.json();
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  await query(
    "UPDATE staff SET is_active=$1, updated_at=NOW() WHERE id=$2",
    [is_active, id]
  );
  return NextResponse.json({ message: "Staff updated." });
}
