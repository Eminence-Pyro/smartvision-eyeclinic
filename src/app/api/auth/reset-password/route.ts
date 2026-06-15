import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { query } from "@/lib/db";
import bcrypt from "bcryptjs";

/**
 * POST /api/auth/reset-password
 * Admin: can reset any staff or patient password
 * Self: can reset own password (requires current_password)
 *
 * Body: { target_id, target_type: "staff"|"patient", new_password, current_password? }
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { target_id, target_type, new_password, current_password } = await req.json();
    const selfId   = (session.user as { id: string }).id;
    const selfRole = (session.user as { role: string }).role;

    if (!target_id || !target_type || !new_password)
      return NextResponse.json({ error: "target_id, target_type and new_password are required." }, { status: 400 });
    if (new_password.length < 8)
      return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });

    const isSelf  = target_id === selfId;
    const isAdmin = selfRole === "admin";

    // Non-admin can only reset their own password and must provide current password
    if (!isAdmin && !isSelf)
      return NextResponse.json({ error: "Forbidden." }, { status: 403 });

    const table = target_type === "patient" ? "patients" : "staff";

    if (isSelf && !isAdmin) {
      if (!current_password)
        return NextResponse.json({ error: "Current password required." }, { status: 400 });
      const rows = await query<{ password_hash: string }>(
        `SELECT password_hash FROM ${table} WHERE id=$1`, [target_id]
      );
      const ok = await bcrypt.compare(current_password, rows[0]?.password_hash || "");
      if (!ok) return NextResponse.json({ error: "Current password is incorrect." }, { status: 400 });
    }

    const hash = await bcrypt.hash(new_password, 12);
    await query(`UPDATE ${table} SET password_hash=$1, updated_at=NOW() WHERE id=$2`, [hash, target_id]);

    return NextResponse.json({ message: "Password updated successfully." });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    console.error("reset-password:", msg);
    return NextResponse.json({ error: "Server error: " + msg }, { status: 500 });
  }
}
