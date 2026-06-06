import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { query } from "@/lib/db";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const role    = (session.user as { role: string }).role;
  const staffId = (session.user as { id: string }).id;

  const period   = req.nextUrl.searchParams.get("period") || "today";
  const dateFilter = period === "week"  ? "visit_date >= CURRENT_DATE - INTERVAL '7 days'"
                   : period === "month" ? "visit_date >= CURRENT_DATE - INTERVAL '30 days'"
                   : "visit_date = CURRENT_DATE";

  /* ── Shared: today stats ── */
  const [visits, revenue, queue] = await Promise.all([
    query<{ total: string; completed: string; in_progress: string; express: string }>(
      `SELECT COUNT(*) AS total,
              COUNT(*) FILTER (WHERE status='completed') AS completed,
              COUNT(*) FILTER (WHERE status NOT IN ('completed','cancelled')) AS in_progress,
              COUNT(*) FILTER (WHERE is_express=TRUE) AS express
       FROM visits WHERE ${dateFilter}`
    ),
    query<{ total: string; cash: string; pos: string; transfer: string; hmo: string }>(
      `SELECT COALESCE(SUM(amount),0) AS total,
              COALESCE(SUM(amount) FILTER (WHERE method='cash'),0) AS cash,
              COALESCE(SUM(amount) FILTER (WHERE method='pos'),0)  AS pos,
              COALESCE(SUM(amount) FILTER (WHERE method='transfer'),0) AS transfer,
              COALESCE(SUM(amount) FILTER (WHERE method='hmo'),0)  AS hmo
       FROM payments p JOIN visits v ON v.id=p.visit_id
       WHERE p.status='paid' AND ${dateFilter}`
    ),
    query<{ waiting: string; in_progress: string; done: string }>(
      `SELECT COUNT(*) FILTER (WHERE status='waiting') AS waiting,
              COUNT(*) FILTER (WHERE status IN ('called','in_progress')) AS in_progress,
              COUNT(*) FILTER (WHERE status='done') AS done
       FROM queue WHERE queue_date=CURRENT_DATE`
    ),
  ]);

  /* ── Admin-only: deeper stats ── */
  if (role === "admin") {
    const [byDept, revByType, topDiagnoses, weeklyTrend, pendingRx, scansToday, surgeriesToday] = await Promise.all([
      /* patients per department today */
      query<{ department: string; count: string }>(
        `SELECT department, COUNT(*) as count FROM queue WHERE queue_date=CURRENT_DATE GROUP BY department ORDER BY count DESC`
      ),
      /* revenue by payment type */
      query<{ type: string; total: string }>(
        `SELECT type, COALESCE(SUM(amount),0) AS total FROM payments p
         JOIN visits v ON v.id=p.visit_id WHERE p.status='paid' AND ${dateFilter}
         GROUP BY type ORDER BY total DESC`
      ),
      /* top diagnoses */
      query<{ diagnosis: string; count: string }>(
        `SELECT COALESCE(diagnosis_right,diagnosis_left,'Unknown') AS diagnosis, COUNT(*) AS count
         FROM clinical_notes cn JOIN visits v ON v.id=cn.visit_id WHERE ${dateFilter}
         GROUP BY diagnosis ORDER BY count DESC LIMIT 5`
      ),
      /* 7-day visit trend */
      query<{ day: string; count: string; revenue: string }>(
        `SELECT DATE(v.visit_date) AS day, COUNT(DISTINCT v.id) AS count,
                COALESCE(SUM(p.amount),0) AS revenue
         FROM visits v LEFT JOIN payments p ON p.visit_id=v.id AND p.status='paid'
         WHERE v.visit_date >= CURRENT_DATE - 6 GROUP BY day ORDER BY day`
      ),
      /* pending prescriptions */
      query<{ count: string }>(
        `SELECT COUNT(*) AS count FROM prescriptions p JOIN visits v ON v.id=p.visit_id
         WHERE v.visit_date=CURRENT_DATE AND p.dispensed=FALSE`
      ),
      query<{ count: string }>(
        `SELECT COUNT(*) AS count FROM scans s JOIN visits v ON v.id=s.visit_id
         WHERE v.visit_date=CURRENT_DATE AND s.findings IS NULL`
      ),
      query<{ count: string }>(
        `SELECT COUNT(*) AS count FROM surgeries s JOIN visits v ON v.id=s.visit_id
         WHERE v.visit_date=CURRENT_DATE AND s.performed_at IS NULL`
      ),
    ]);

    return NextResponse.json({
      visits:            visits[0],
      revenue:           revenue[0],
      queue:             queue[0],
      by_department:     byDept,
      revenue_by_type:   revByType,
      top_diagnoses:     topDiagnoses,
      weekly_trend:      weeklyTrend,
      pending_prescriptions: parseInt(pendingRx[0]?.count || "0"),
      scans_pending:     parseInt(scansToday[0]?.count || "0"),
      surgeries_pending: parseInt(surgeriesToday[0]?.count || "0"),
    });
  }

  return NextResponse.json({ visits: visits[0], revenue: revenue[0], queue: queue[0] });
}
