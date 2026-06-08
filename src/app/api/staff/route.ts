import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { query } from "@/lib/db";
import { hashPassword } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if ((session.user as { role: string }).role !== "admin")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const rows = await query(
    "SELECT id,first_name,last_name,email,phone,role,department,is_active,created_at FROM staff ORDER BY last_name,first_name"
  );
  return NextResponse.json({ staff: rows });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if ((session.user as { role: string }).role !== "admin")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { first_name, last_name, email, phone, role: staffRole, department, password } = await req.json();
  if (!first_name || !last_name || !email || !staffRole || !password)
    return NextResponse.json({ error: "All required fields must be filled." }, { status: 400 });
  if (password.length < 8)
    return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });

  const existing = await query("SELECT id FROM staff WHERE email=$1", [email.toLowerCase()]);
  if (existing.length) return NextResponse.json({ error: "Email already registered." }, { status: 409 });

  const password_hash = await hashPassword(password);
  await query(
    "INSERT INTO staff (first_name,last_name,email,phone,role,department,password_hash,is_active) VALUES ($1,$2,$3,$4,$5,$6,$7,TRUE)",
    [first_name, last_name, email.toLowerCase(), phone||null, staffRole, department||null, password_hash]
  );
  return NextResponse.json({ message: "Staff account created." }, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if ((session.user as { role: string }).role !== "admin")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id, is_active, first_name, last_name, phone, department, role } = await req.json();
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  // Prevent admin from disabling their own account
  const currentAdminId = (session.user as { id: string }).id;
  if (id === currentAdminId && is_active === false)
    return NextResponse.json({ error: "You cannot deactivate your own admin account." }, { status: 403 });

  const updates: string[] = [];
  const params: unknown[] = [];

  if (is_active !== undefined) { params.push(is_active); updates.push(`is_active=$${params.length}`); }
  if (first_name)  { params.push(first_name);  updates.push(`first_name=$${params.length}`); }
  if (last_name)   { params.push(last_name);   updates.push(`last_name=$${params.length}`); }
  if (phone !== undefined) { params.push(phone||null); updates.push(`phone=$${params.length}`); }
  if (department !== undefined) { params.push(department||null); updates.push(`department=$${params.length}`); }
  if (role)        { params.push(role);        updates.push(`role=$${params.length}`); }

  if (!updates.length) return NextResponse.json({ error: "Nothing to update." }, { status: 400 });
  updates.push("updated_at=NOW()");

  params.push(id);
  await query(`UPDATE staff SET ${updates.join(",")} WHERE id=$${params.length}`, params);
  return NextResponse.json({ message: "Staff updated." });
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if ((session.user as { role: string }).role !== "admin")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await req.json();
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  // Prevent deleting own account
  if (id === (session.user as { id: string }).id)
    return NextResponse.json({ error: "You cannot delete your own account." }, { status: 403 });

  // Soft delete — deactivate instead of hard delete to preserve audit trail
  await query("UPDATE staff SET is_active=FALSE, updated_at=NOW() WHERE id=$1", [id]);
  return NextResponse.json({ message: "Account deactivated." });
}
