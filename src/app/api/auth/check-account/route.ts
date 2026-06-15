import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { query } from "@/lib/db";
import bcrypt from "bcryptjs";

/**
 * POST /api/auth/check-account  (admin only — diagnostic tool)
 * Body: { email, password, type: "staff"|"patient" }
 * Returns: whether the account exists and whether the password matches
 */
export async function POST(req: NextRequest) {
  if (process.env.NODE_ENV === "production")
    return NextResponse.json({ error: "Not available in production." }, { status: 403 });

  const session = await getServerSession(authOptions);
  if (!session || (session.user as { role: string }).role !== "admin")
    return NextResponse.json({ error: "Admin only." }, { status: 403 });

  const { email, password, type } = await req.json();
  const table = type === "patient" ? "patients" : "staff";

  const rows = await query<{ id: string; email: string; password_hash: string; is_active?: boolean }>(
    `SELECT id, email, password_hash, is_active FROM ${table} WHERE email=$1 LIMIT 1`,
    [email?.toLowerCase()?.trim()]
  );

  if (!rows.length) return NextResponse.json({ found: false, message: "No account with that email." });

  const row = rows[0];
  const passwordMatch = password ? await bcrypt.compare(password, row.password_hash || "") : null;
  const hasHash = !!row.password_hash && row.password_hash.length > 10;

  return NextResponse.json({
    found: true,
    id:            row.id,
    email:         row.email,
    is_active:     row.is_active ?? true,
    has_password:  hasHash,
    password_ok:   passwordMatch,
    hash_prefix:   row.password_hash?.slice(0, 7) ?? "none",
  });
}
