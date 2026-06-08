import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { query } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const id   = (session.user as { id: string }).id;
  const role = (session.user as { role: string }).role;
  const table = role === "patient" ? "patients" : "staff";

  const rows = await query(
    `SELECT id, first_name, last_name, email, phone, avatar_url,
            ${role === "patient" ? "gender, date_of_birth, address, blood_group, genotype, allergies, hmo_name, hmo_number, patient_number" : "role, department"}
     FROM ${table} WHERE id=$1 LIMIT 1`,
    [id]
  );
  return NextResponse.json({ profile: rows[0] || null });
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const id   = (session.user as { id: string }).id;
  const role = (session.user as { role: string }).role;
  const table = role === "patient" ? "patients" : "staff";
  const body  = await req.json();

  const allowed = ["first_name","last_name","phone","avatar_url"];
  if (role === "patient") allowed.push("address","blood_group","genotype","allergies","hmo_name","hmo_number");

  // Handle password change
  if (body.new_password) {
    if (!body.current_password)
      return NextResponse.json({ error: "Current password is required." }, { status: 400 });
    if (body.new_password.length < 8)
      return NextResponse.json({ error: "New password must be at least 8 characters." }, { status: 400 });

    const rows = await query<{ password_hash: string }>(
      `SELECT password_hash FROM ${table} WHERE id=$1`, [id]
    );
    const ok = await bcrypt.compare(body.current_password, rows[0]?.password_hash || "");
    if (!ok) return NextResponse.json({ error: "Current password is incorrect." }, { status: 400 });

    const hash = await bcrypt.hash(body.new_password, 12);
    await query(`UPDATE ${table} SET password_hash=$1, updated_at=NOW() WHERE id=$2`, [hash, id]);
    return NextResponse.json({ message: "Password updated." });
  }

  const updates: string[] = [];
  const params: unknown[] = [];

  for (const key of allowed) {
    if (body[key] !== undefined) {
      params.push(body[key] || null);
      updates.push(`${key}=$${params.length}`);
    }
  }
  if (!updates.length) return NextResponse.json({ error: "Nothing to update." }, { status: 400 });
  updates.push("updated_at=NOW()");

  params.push(id);
  await query(`UPDATE ${table} SET ${updates.join(",")} WHERE id=$${params.length}`, params);
  return NextResponse.json({ message: "Profile updated." });
}
