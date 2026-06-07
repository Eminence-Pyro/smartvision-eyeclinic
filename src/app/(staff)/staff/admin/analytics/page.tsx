"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Users, CreditCard, Activity, TrendingUp, Pill,
  Camera, Scissors, Clock, CheckCircle2, BarChart2,
  ArrowUp, Calendar, RefreshCw
} from "lucide-react";
import StaffLayout from "@/components/staff/StaffLayout";
import { formatCurrency } from "@/lib/utils";

interface Analytics {
  visits: { total: string; completed: string; in_progress: string; express: string };
  revenue: { total: string; cash: string; pos: string; transfer: string; hmo: string };
  queue:   { waiting: string; in_progress: string; done: string };
  by_department?: { department: string; count: string }[];
  revenue_by_type?: { type: string; total: string }[];
  weekly_trend?: { day: string; count: string; revenue: string }[];
  pending_prescriptions?: number;
  scans_pending?: number;
  surgeries_pending?: number;
}

const BAR_COLORS = ["bg-brand", "bg-accent", "bg-purple-400", "bg-blue-400", "bg-indigo-400", "bg-violet-400", "bg-cyan-400"];

export default function AdminAnalyticsPage() {
  const { data: session, status } = useSession();
  const router   = useRouter();
  const [data, setData]     = useState<Analytics | null>(null);
  const [period, setPeriod] = useState<"today"|"week"|"month">("today");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/staff/login");
    const role = (session?.user as { role?: string })?.role;
    if (status === "authenticated" && role !== "admin") router.push("/staff/dashboard");
  }, [session, status, router]);

  const load = async () => {
    setLoading(true);
    const res = await fetch(`/api/staff/analytics?period=${period}`);
    const d   = await res.json();
    setData(d);
    setLoading(false);
  };

  useEffect(() => { if (status === "authenticated") load(); }, [period, status]);

  const maxDept = data?.by_department ? Math.max(...data.by_department.map(d => parseInt(d.count))) : 1;
  const maxTrend = data?.weekly_trend ? Math.max(...data.weekly_trend.map(d => parseInt(d.count))) : 1;

  const STAT_CARDS = data ? [
    { label:"Total Visits",     value:data.visits.total,              icon:Users,        color:"brand",  sub:`${data.visits.in_progress} in progress` },
    { label:"Completed",        value:data.visits.completed,          icon:CheckCircle2, color:"green",  sub:`${data.visits.express} express` },
    { label:"Total Revenue",    value:formatCurrency(parseFloat(data.revenue.total)), icon:CreditCard, color:"purple", sub:`Cash: ${formatCurrency(parseFloat(data.revenue.cash))}` },
    { label:"Queue — Waiting",  value:data.queue.waiting,             icon:Clock,        color:"orange", sub:`${data.queue.done} done today` },
    { label:"Pending Rx",       value:String(data.pending_prescriptions ?? 0), icon:Pill,   color:"teal",   sub:"Awaiting pharmacy" },
    { label:"Scans Pending",    value:String(data.scans_pending ?? 0), icon:Camera,      color:"blue",   sub:"Awaiting scan room" },
    { label:"Surgeries Pending",value:String(data.surgeries_pending ?? 0), icon:Scissors,color:"red",    sub:"Awaiting theatre" },
    { label:"Express Patients", value:data.visits.express,            icon:Activity,     color:"yellow", sub:"Priority service" },
  ] : [];

  const COLOR_MAP: Record<string,string> = {
    brand:"from-brand-50 to-brand-100 border-brand-200 text-brand",
    green:"from-green-50 to-green-100 border-green-200 text-green-700",
    purple:"from-purple-50 to-purple-100 border-purple-200 text-purple-700",
    orange:"from-orange-50 to-orange-100 border-orange-200 text-orange-700",
    teal:"from-teal-50 to-teal-100 border-teal-200 text-teal-700",
    blue:"from-blue-50 to-blue-100 border-blue-200 text-blue-700",
    red:"from-red-50 to-red-100 border-red-200 text-red-700",
    yellow:"from-yellow-50 to-yellow-100 border-yellow-200 text-yellow-700",
  };

  return (
    <StaffLayout>
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="font-bold text-2xl text-gray-900 flex items-center gap-2">
              <BarChart2 className="h-6 w-6 text-brand" /> Analytics Dashboard
            </h1>
            <p className="text-gray-500 text-sm">Full clinic performance overview</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex gap-1 p-1 bg-gray-100 rounded-xl">
              {(["today","week","month"] as const).map(p => (
                <button key={p} onClick={() => setPeriod(p)}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${period === p ? "brand-gradient text-white shadow" : "text-gray-500 hover:text-brand"}`}>
                  {p.charAt(0).toUpperCase() + p.slice(1)}
                </button>
              ))}
            </div>
            <button onClick={load} disabled={loading}
              className="flex items-center gap-1.5 border border-gray-200 px-4 py-2.5 rounded-xl text-sm text-gray-600 hover:border-brand hover:text-brand">
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {STAT_CARDS.map(s => {
            const Icon = s.icon;
            const cls  = COLOR_MAP[s.color] || COLOR_MAP.brand;
            return (
              <div key={s.label} className={`rounded-2xl border bg-gradient-to-br p-5 ${cls}`}>
                <div className="flex items-center justify-between mb-3">
                  <Icon className="h-5 w-5 opacity-70" />
                  <ArrowUp className="h-3.5 w-3.5 opacity-40" />
                </div>
                <p className="text-3xl font-black mb-1">{loading ? "…" : s.value}</p>
                <p className="text-xs font-bold uppercase tracking-wide opacity-70">{s.label}</p>
                <p className="text-xs opacity-50 mt-0.5">{s.sub}</p>
              </div>
            );
          })}
        </div>

        {/* Charts row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 7-day visit trend */}
          {data?.weekly_trend && (
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h3 className="font-bold text-gray-900 mb-5 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-brand" /> Visit Trend (7 Days)
              </h3>
              <div className="flex items-end gap-2 h-40">
                {data.weekly_trend.map((d, i) => {
                  const height = maxTrend > 0 ? (parseInt(d.count) / maxTrend) * 100 : 0;
                  return (
                    <div key={d.day} className="flex-1 flex flex-col items-center gap-1">
                      <p className="text-xs font-bold text-brand">{d.count}</p>
                      <div className="w-full rounded-t-lg brand-gradient transition-all duration-500" style={{ height:`${Math.max(height, 4)}%` }} />
                      <p className="text-[10px] text-gray-400 rotate-45 mt-1">
                        {new Date(d.day).toLocaleDateString("en",{weekday:"short"})}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Revenue by payment method */}
          {data?.revenue && (
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h3 className="font-bold text-gray-900 mb-5 flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-brand" /> Revenue by Method
              </h3>
              <div className="space-y-3">
                {[
                  { label:"Cash",         value:parseFloat(data.revenue.cash),     color:"bg-brand" },
                  { label:"POS",          value:parseFloat(data.revenue.pos),      color:"bg-accent" },
                  { label:"Bank Transfer",value:parseFloat(data.revenue.transfer), color:"bg-purple-500" },
                  { label:"HMO",          value:parseFloat(data.revenue.hmo),      color:"bg-indigo-500" },
                ].map(item => {
                  const total = parseFloat(data.revenue.total) || 1;
                  const pct   = Math.round((item.value / total) * 100);
                  return (
                    <div key={item.label}>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-gray-600 font-medium">{item.label}</span>
                        <span className="font-bold text-gray-900">{formatCurrency(item.value)} <span className="text-gray-400 font-normal text-xs">({pct}%)</span></span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className={`h-full ${item.color} rounded-full transition-all duration-700`} style={{ width:`${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                <span className="text-xs text-gray-500 font-semibold uppercase tracking-wide">Total Revenue</span>
                <span className="font-black text-brand text-lg">{formatCurrency(parseFloat(data?.revenue.total || "0"))}</span>
              </div>
            </div>
          )}
        </div>

        {/* Department breakdown + Revenue by type */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {data?.by_department && data.by_department.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h3 className="font-bold text-gray-900 mb-5 flex items-center gap-2">
                <Users className="h-4 w-4 text-brand" /> Patients by Department
              </h3>
              <div className="space-y-3">
                {data.by_department.map((d, i) => {
                  const pct = Math.round((parseInt(d.count) / maxDept) * 100);
                  const deptLabel = d.department?.replace(/_/g," ") || "Unknown";
                  return (
                    <div key={d.department}>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="capitalize text-gray-700 font-medium">{deptLabel}</span>
                        <span className="font-bold text-gray-900">{d.count}</span>
                      </div>
                      <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className={`h-full ${BAR_COLORS[i % BAR_COLORS.length]} rounded-full transition-all duration-700`} style={{ width:`${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {data?.revenue_by_type && data.revenue_by_type.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h3 className="font-bold text-gray-900 mb-5 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-brand" /> Revenue by Service Type
              </h3>
              <div className="space-y-3">
                {data.revenue_by_type.map((r, i) => {
                  const totalRev = data.revenue_by_type!.reduce((s, x) => s + parseFloat(x.total), 0) || 1;
                  const pct = Math.round((parseFloat(r.total) / totalRev) * 100);
                  return (
                    <div key={r.type}>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="capitalize text-gray-700 font-medium">{r.type?.replace(/_/g," ")}</span>
                        <span className="font-bold text-gray-900">{formatCurrency(parseFloat(r.total))} <span className="text-gray-400 text-xs">({pct}%)</span></span>
                      </div>
                      <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className={`h-full ${BAR_COLORS[i % BAR_COLORS.length]} rounded-full transition-all duration-700`} style={{ width:`${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Top diagnoses */}
        {data?.top_diagnoses && Array.isArray(data.top_diagnoses) && data.top_diagnoses.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h3 className="font-bold text-gray-900 mb-5 flex items-center gap-2">
              <Activity className="h-4 w-4 text-brand" /> Top Diagnoses
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {(data.top_diagnoses as { diagnosis: string; count: string }[]).map((d, i) => (
                <div key={i} className="bg-brand-50 border border-brand-100 rounded-xl p-4 text-center">
                  <p className="text-3xl font-black text-brand">{d.count}</p>
                  <p className="text-xs text-gray-600 mt-1 leading-tight">{d.diagnosis}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </StaffLayout>
  );
}
