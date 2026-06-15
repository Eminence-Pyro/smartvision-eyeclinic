import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { query } from "@/lib/db";
import { cacheGet, cacheSet } from "@/lib/cache";

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as { role: string }).role !== "admin")
    return NextResponse.json({ error: "Admin only." }, { status: 403 });

  const force = req.nextUrl.searchParams.get("refresh") === "1";
  const cacheKey = "analytics:dashboard";

  if (!force) {
    const cached = cacheGet<Record<string, unknown>>(cacheKey);
    if (cached) return NextResponse.json({ ...cached, cached: true });
  }

  // Run all queries in parallel
  const [todayVisits, todayRevenue, pendingRx, diagnosisCounts, revByMethod, weeklyVisits, statusCounts] =
    await Promise.all([
      query<{ count: string }>(`SELECT COUNT(*) as count FROM visits WHERE visit_date = CURRENT_DATE`),
      query<{ total: string }>(`SELECT COALESCE(SUM(amount),0) as total FROM payments WHERE DATE(paid_at)=CURRENT_DATE`),
      query<{ count: string }>(`SELECT COUNT(*) as count FROM prescriptions WHERE dispensed=FALSE`),
      query<{ diagnosis: string; count: string }>(
        `SELECT diagnosis_right as diagnosis, COUNT(*) as count
         FROM clinical_notes WHERE diagnosis_right IS NOT NULL AND diagnosis_right != ''
         GROUP BY diagnosis_right ORDER BY count DESC LIMIT 8`
      ),
      query<{ method: string; total: string }>(
        `SELECT method, COALESCE(SUM(amount),0) as total FROM payments
         WHERE DATE(paid_at) >= CURRENT_DATE - 30 GROUP BY method`
      ),
      query<{ visit_date: string; count: string }>(
        `SELECT visit_date::text, COUNT(*) as count FROM visits
         WHERE visit_date >= CURRENT_DATE - 6 GROUP BY visit_date ORDER BY visit_date`
      ),
      query<{ status: string; count: string }>(
        `SELECT status, COUNT(*) as count FROM visits
         WHERE visit_date = CURRENT_DATE GROUP BY status`
      ),
    ]);

  const data = {
    today_visits:   parseInt(todayVisits[0]?.count  || "0"),
    today_revenue:  parseFloat(todayRevenue[0]?.total || "0"),
    pending_rx:     parseInt(pendingRx[0]?.count    || "0"),
    diagnosis_counts: diagnosisCounts,
    revenue_by_method: revByMethod,
    weekly_visits:   weeklyVisits,
    status_counts:   statusCounts,
    generated_at:    new Date().toISOString(),
  };

  cacheSet(cacheKey, data, CACHE_TTL);
  return NextResponse.json({ ...data, cached: false });
}
