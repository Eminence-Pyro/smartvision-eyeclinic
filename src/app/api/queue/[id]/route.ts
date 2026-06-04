import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { query } from "@/lib/db";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { status } = await req.json();
  const timeField = status === "called" ? ", called_at=NOW()" : status === "done" ? ", done_at=NOW()" : "";
  await query(`UPDATE queue SET status=$1 ${timeField} WHERE id=$2`, [status, params.id]);
  return NextResponse.json({ message: "Queue updated." });
}
