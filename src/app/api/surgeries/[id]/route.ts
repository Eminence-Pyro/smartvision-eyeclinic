import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { query } from "@/lib/db";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const surgeonId = (session.user as { id: string }).id;
  const fields = { ...body, surgeon_id: surgeonId, performed_at: new Date().toISOString(), updated_at: new Date().toISOString() };
  const keys = Object.keys(fields);
  const vals = Object.values(fields);
  const setClause = keys.map((k, i) => `${k}=$${i+1}`).join(",");
  vals.push(params.id);
  await query(`UPDATE surgeries SET ${setClause} WHERE id=$${vals.length}`, vals);
  return NextResponse.json({ message: "Surgery updated." });
}
