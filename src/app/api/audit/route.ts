import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { query } from "@/lib/db";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as { role: string }).role !== "admin")
    return NextResponse.json({ error: "Admin only." }, { status: 403 });

  const limit = parseInt(req.nextUrl.searchParams.get("limit") || "50");
  const rows  = await query(
    `SELECT al.*, s.first_name, s.last_name, s.role as actor_role
     FROM audit_log al
     LEFT JOIN staff s ON s.id = al.actor_id
     ORDER BY al.created_at DESC
     LIMIT $1`,
    [limit]
  );
  return NextResponse.json({ logs: rows });
}

export async function POST(req: NextRequest) {
  // Internal helper — create audit log entry
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { action, entity_type, entity_id, details } = await req.json();
  const actorId = (session.user as { id: string }).id;

  try {
    await query(
      `INSERT INTO audit_log (actor_id, action, entity_type, entity_id, details, created_at)
       VALUES ($1,$2,$3,$4,$5,NOW())`,
      [actorId, action, entity_type || null, entity_id || null,
       details ? JSON.stringify(details) : null]
    );
  } catch {
    // Silently fail if audit_log table doesn't exist yet
  }
  return NextResponse.json({ ok: true });
}
