import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { query } from "@/lib/db";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [visits, revenue, prescriptions, scans, surgeries] = await Promise.all([
    query<{ total: string; completed: string; in_progress: string }>(
      `SELECT
         COUNT(*)                                            AS total,
         COUNT(*) FILTER (WHERE status='completed')         AS completed,
         COUNT(*) FILTER (WHERE status NOT IN ('completed','cancelled')) AS in_progress
       FROM visits WHERE visit_date=CURRENT_DATE`
    ),
    query<{ total: string }>(
      "SELECT COALESCE(SUM(amount),0) AS total FROM payments WHERE status='paid' AND DATE(paid_at)=CURRENT_DATE"
    ),
    query<{ count: string }>(
      "SELECT COUNT(*) AS count FROM prescriptions p JOIN visits v ON v.id=p.visit_id WHERE v.visit_date=CURRENT_DATE AND p.dispensed=FALSE"
    ),
    query<{ count: string }>(
      "SELECT COUNT(*) AS count FROM scans s JOIN visits v ON v.id=s.visit_id WHERE v.visit_date=CURRENT_DATE AND s.findings IS NULL"
    ),
    query<{ count: string }>(
      "SELECT COUNT(*) AS count FROM surgeries s JOIN visits v ON v.id=s.visit_id WHERE v.visit_date=CURRENT_DATE AND s.performed_at IS NULL"
    ),
  ]);

  return NextResponse.json({
    total_visits:         parseInt(visits[0]?.total         || "0"),
    completed:            parseInt(visits[0]?.completed     || "0"),
    in_progress:          parseInt(visits[0]?.in_progress   || "0"),
    total_revenue:        parseFloat(revenue[0]?.total      || "0"),
    pending_prescriptions:parseInt(prescriptions[0]?.count  || "0"),
    booked_scans:         parseInt(scans[0]?.count          || "0"),
    booked_surgeries:     parseInt(surgeries[0]?.count      || "0"),
  });
}
