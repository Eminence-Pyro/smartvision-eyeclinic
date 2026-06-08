"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Users, CreditCard, Activity, Stethoscope,
  Camera, Scissors, Pill, UserPlus, Clock,
  TrendingUp, CheckCircle2, BarChart2, ArrowRight
} from "lucide-react";
import StaffLayout from "@/components/staff/StaffLayout";
import { formatCurrency } from "@/lib/utils";

const ROLE_SHORTCUTS: Record<string, { href: string; label: string; icon: React.ElementType; color: string }[]> = {
  admin:      [
    { href:"/staff/front-desk",         label:"Front Desk",    icon:UserPlus,    color:"bg-blue-100 text-blue-600"    },
    { href:"/staff/accounts",           label:"Accounts",      icon:CreditCard,  color:"bg-green-100 text-green-600"  },
    { href:"/staff/doctor",             label:"Doctor",        icon:Stethoscope, color:"bg-purple-100 text-purple-600"},
    { href:"/staff/admin/analytics",    label:"Analytics",     icon:BarChart2,   color:"bg-brand-100 text-brand"      },
  ],
  front_desk: [{ href:"/staff/front-desk", label:"Register Patient", icon:UserPlus,    color:"bg-blue-100 text-blue-600"   }],
  va_room:    [{ href:"/staff/va-room",    label:"VA Assessment",    icon:Activity,    color:"bg-purple-100 text-purple-600"}],
  accounts:   [{ href:"/staff/accounts",   label:"Record Payment",   icon:CreditCard,  color:"bg-green-100 text-green-600" }],
  doctor:     [{ href:"/staff/doctor",     label:"Doctor's Office",  icon:Stethoscope, color:"bg-indigo-100 text-indigo-600"}],
  scan_room:  [{ href:"/staff/scan-room",  label:"Scan Room",        icon:Camera,      color:"bg-orange-100 text-orange-600"}],
  theatre:    [{ href:"/staff/theatre",    label:"Theatre",          icon:Scissors,    color:"bg-red-100 text-red-600"     }],
  pharmacy:   [{ href:"/staff/pharmacy",   label:"Pharmacy",         icon:Pill,        color:"bg-teal-100 text-teal-600"   }],
};

export default function StaffDashboard() {
  const { data: session, status } = useSession();
  const router  = useRouter();
  const [stats, setStats]   = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/staff/login");
    if (status === "authenticated") {
      const r = (session?.user as { role?: string })?.role;
      if (r === "patient") router.push("/portal/dashboard");
    }
  }, [status, router]);

  useEffect(() => {
    if (status !== "authenticated") return;
    fetch("/api/staff/analytics?period=today")
      .then(r => r.json())
      .then(d => { setStats(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [status]);

  const role  = (session?.user as { role?: string })?.role || "";
  const name  = session?.user?.name || "Staff";
  const shortcuts = ROLE_SHORTCUTS[role] || [];

  const visits  = stats?.visits  as Record<string,string> | undefined;
  const revenue = stats?.revenue as Record<string,string> | undefined;
  const queue   = stats?.queue   as Record<string,string> | undefined;

  return (
    <StaffLayout>
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Welcome banner */}
        <div className="brand-gradient rounded-3xl p-8 text-white relative overflow-hidden">
          <div className="absolute right-0 top-0 w-64 h-64 rounded-full bg-white/5 -translate-y-1/2 translate-x-1/4" />
          <div className="relative z-10">
            <p className="text-brand-200 text-sm mb-1">
              Good {new Date().getHours() < 12 ? "morning" : new Date().getHours() < 17 ? "afternoon" : "evening"}
            </p>
            <h1 className="font-serif font-black text-3xl mb-1">{name}</h1>
            <p className="text-brand-200 text-sm capitalize">{role.replace("_"," ")} · Anya Specialist Eye Clinic</p>
            <p className="text-brand-100 text-sm mt-3">
              {new Date().toLocaleDateString("en-NG", { weekday:"long", year:"numeric", month:"long", day:"numeric" })}
            </p>
          </div>
        </div>

        {/* Quick shortcuts */}
        {shortcuts.length > 0 && (
          <div>
            <h2 className="font-bold text-gray-900 mb-4">Quick Access</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {shortcuts.map(s => {
                const Icon = s.icon;
                return (
                  <Link key={s.href} href={s.href}
                    className="bg-white rounded-2xl border border-gray-100 p-5 flex flex-col items-center gap-3 text-center card-hover group hover:shadow-md hover:border-brand-100 transition-all">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${s.color}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <p className="text-sm font-semibold text-gray-700 group-hover:text-brand">{s.label}</p>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* Stats — visible to admin, doctor, accounts */}
        {["admin","doctor","accounts"].includes(role) && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-gray-900">Today at a Glance</h2>
              {role === "admin" && (
                <Link href="/staff/admin/analytics"
                  className="flex items-center gap-1.5 text-sm text-brand font-semibold hover:underline">
                  Full Analytics <ArrowRight className="h-4 w-4" />
                </Link>
              )}
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label:"Total Visits",  value:visits?.total,    icon:Users,        cls:"bg-brand-50 border-brand-100 text-brand" },
                { label:"In Progress",   value:visits?.in_progress, icon:Clock,     cls:"bg-orange-50 border-orange-100 text-orange-600" },
                { label:"Completed",     value:visits?.completed, icon:CheckCircle2,cls:"bg-green-50 border-green-100 text-green-600" },
                { label:"Revenue",       value:revenue ? formatCurrency(parseFloat(revenue.total)) : "—", icon:TrendingUp, cls:"bg-purple-50 border-purple-100 text-purple-600" },
              ].map(s => {
                const Icon = s.icon;
                return (
                  <div key={s.label} className={`rounded-2xl border p-5 ${s.cls}`}>
                    <Icon className="h-5 w-5 mb-3 opacity-70" />
                    <p className="text-2xl font-black">{loading ? "…" : (s.value ?? "—")}</p>
                    <p className="text-xs font-bold uppercase tracking-wide opacity-60 mt-1">{s.label}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Queue snapshot */}
        {queue && (
          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <h3 className="font-bold text-gray-900 mb-4 text-sm">Queue Status — Right Now</h3>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label:"Waiting",     value:queue.waiting,     bg:"bg-yellow-50 border-yellow-200 text-yellow-700" },
                { label:"In Progress", value:queue.in_progress, bg:"bg-blue-50 border-blue-200 text-blue-700"       },
                { label:"Done Today",  value:queue.done,        bg:"bg-green-50 border-green-200 text-green-700"    },
              ].map(q => (
                <div key={q.label} className={`rounded-xl border p-4 text-center ${q.bg}`}>
                  <p className="text-2xl font-black">{loading ? "…" : q.value}</p>
                  <p className="text-xs font-bold uppercase tracking-wide opacity-70 mt-0.5">{q.label}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Patient flow */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h2 className="font-bold text-gray-900 mb-4 text-sm">Patient Flow Reminder</h2>
          <div className="flex items-center gap-2 flex-wrap text-xs">
            {[
              { step:"1. Front Desk",   color:"brand-gradient text-white" },
              { step:"2. Accounts",     color:"bg-green-600 text-white"   },
              { step:"3. VA Room",      color:"bg-purple-600 text-white"  },
              { step:"4. Doctor",       color:"bg-indigo-600 text-white"  },
              { step:"5a. Pharmacy",    color:"bg-teal-600 text-white"    },
              { step:"5b. Scan Room",   color:"bg-orange-600 text-white"  },
              { step:"5c. Theatre",     color:"bg-red-600 text-white"     },
            ].map((s, i) => (
              <div key={i} className="flex items-center gap-1.5">
                <span className={`px-3 py-1.5 rounded-xl font-semibold ${s.color}`}>{s.step}</span>
                {i < 3 && <span className="text-gray-300 font-bold">→</span>}
                {i === 3 && <span className="text-gray-300 font-bold">→</span>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </StaffLayout>
  );
}
