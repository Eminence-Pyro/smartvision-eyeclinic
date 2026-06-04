import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { query } from "@/lib/db";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { findings, image_urls } = await req.json();
  const staffId = (session.user as { id: string }).id;
  const [scan] = await query<{ visit_id: string }>(
    "UPDATE scans SET findings=$1, image_urls=$2, performed_by=$3, performed_at=NOW() WHERE id=$4 RETURNING visit_id",
    [findings||null, image_urls||[], staffId, params.id]
  );
  if (scan?.visit_id) {
    await query("UPDATE visits SET status='scan_done', updated_at=NOW() WHERE id=$1", [scan.visit_id]);
  }
  return NextResponse.json({ message: "Scan updated." });
}
