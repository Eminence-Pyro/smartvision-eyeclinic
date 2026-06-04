import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { query } from "@/lib/db";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const staffId = (session.user as { id: string }).id;
  await query(
    "UPDATE prescriptions SET dispensed=TRUE, dispensed_by=$1, dispensed_at=NOW() WHERE id=$2",
    [staffId, params.id]
  );
  return NextResponse.json({ message: "Dispensed." });
}
