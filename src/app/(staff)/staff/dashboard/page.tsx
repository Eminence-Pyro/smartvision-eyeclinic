"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Users, CreditCard, Activity, Stethoscope,
  Camera, Scissors, Pill, UserPlus, Clock,
  TrendingUp, CheckCircle2, AlertCircle
} from "lucide-react";
import StaffLayout from "@/components/staff/StaffLayout";
import { formatCurrency } from "@/lib/utils";

interface Stats {
  total_visits: number;
  completed: number;
  in_progress: number;
  total_revenue: number;
  pending_prescriptions: number;
  booked_scans: number;
  booked_surgeries: number;
}

const ROLE_SHORTCUTS: Record<string, { href: string; label: string; icon: React.ElementType; color: string }[]> = {
  admin:      [
    { href:"/staff/front-desk", label:"Front Desk",    icon:UserPlus,    color:"bg-blue-100 text-blue-600"   },
    { href:"/staff/accounts",   label:"Accounts",      icon:CreditCard,  color:"bg-green-100 text-green-600" },
    { href:"/staff/doctor",     label:"Doctor",        icon:Stethoscope, color:"bg-purple-100 text-purple-600"},
    { href:"/staff/admin",      label:"Staff Admin",   icon:Users,       color:"bg-brand-100 text-brand"     },
  ],
  front_desk: [{ href:"/staff/front-desk", label:"Register Patient", icon:UserPlus,   color:"bg-blue-100 text-blue-600"   }],
  va_room:    [{ href:"/staff/va-room",    label:"VA Assessment",    icon:Activity,   color:"bg-purple-100 text-purple-600"}],
  accounts:   [{ href:"/staff/accounts",   label:"Record Payment",   icon:CreditCard, color:"bg-green-100 text-green-600" }],
  doctor:     [{ href:"/staff/doctor",     label:"Doctor's Office",  icon:Stethoscope,color:"bg-indigo-100 text-indigo-600"}],
  scan_room:  [{ href:"/staff/scan-room",  label:"Scan Room",        icon:Camera,     color:"bg-orange-100 text-orange-600"}],
  theatre:    [{ href:"/staff/theatre",    label:"Theatre",          icon:Scissors,   color:"bg-red-100 text-red-600"     }],
  pharmacy:   [{ href:"/staff/pharmacy",   label:"Pharmacy",         icon:Pill,       color:"bg-teal-100 text-teal-600"   }],
};

export default function StaffDashboard() {
  const { data: session, status } = useSession();
  const router  = useRouter();
  const [stats, setStats]   = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/staff/login");
  }, [status, router]);

  useEffect(() => {
    if (status !== "authenticated") return;
    fetch("/api/staff/stats")
      .then(r => r.json())
      .then(d => { setStats(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [status]);

  const role  = (session?.user as { role?: string })?.role || "";
  const name  = session?.user?.name || "Staff";
  const shortcuts = ROLE_SHORTCUTS[role] || [];

  const STAT_CARDS = [
    { label:"Today's Visits",       value: stats?.total_visits ?? "—",     icon:Users,         color:"brand"  },
    { label:"In Progress",           value: stats?.in_progress  ?? "—",     icon:Clock,         color:"orange" },
    { label:"Completed",             value: stats?.completed    ?? "—",     icon:CheckCircle2,  color:"green"  },
    { label:"Today's Revenue",      value: stats ? formatCurrency(stats.total_revenue) : "—", icon:TrendingUp, color:"purple" },
    { label:"Pending Prescriptions", value: stats?.pending_prescriptions ?? "—", icon:Pill,    color:"teal"   },
    { label:"Scans Booked",          value: stats?.booked_scans    ?? "—",  icon:Camera,        color:"blue"   },
    { label:"Surgeries Booked",      value: stats?.booked_surgeries ?? "—", icon:Scissors,      color:"red"    },
  ];

  const COLOR_MAP: Record<string, string> = {
    brand: "bg-brand-50 text-brand border-brand-100",
    orange:"bg-orange-50 text-orange-600 border-orange-100",
    green: "bg-green-50 text-green-600 border-green-100",
    purple:"bg-purple-50 text-purple-600 border-purple-100",
    teal:  "bg-teal-50 text-teal-600 border-teal-100",
    blue:  "bg-blue-50 text-blue-600 border-blue-100",
    red:   "bg-red-50 text-red-600 border-red-100",
  };

  return (
    <StaffLayout>
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Welcome */}
        <div className="brand-gradient rounded-3xl p-8 text-white relative overflow-hidden">
          <div className="absolute right-0 top-0 w-64 h-64 rounded-full bg-white/5 -translate-y-1/2 translate-x-1/4" />
          <div className="relative z-10">
            <p className="text-brand-100 text-sm mb-1">Good {new Date().getHours() < 12 ? "morning" : new Date().getHours() < 17 ? "afternoon" : "evening"}</p>
            <h1 className="font-serif font-black text-3xl mb-1">{name}</h1>
            <p className="text-brand-200 text-sm capitalize">{role.replace("_", " ")} · Anya Specialist Eye Clinic</p>
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
                    className="bg-white rounded-2xl border border-gray-100 p-5 flex flex-col items-center gap-3 text-center card-hover group">
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

        {/* Stats (admin/doctor see all, others see relevant) */}
        {["admin","doctor","accounts"].includes(role) && (
          <div>
            <h2 className="font-bold text-gray-900 mb-4">Today at a Glance</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {STAT_CARDS.map(s => {
                const Icon = s.icon;
                const cls  = COLOR_MAP[s.color] || COLOR_MAP.brand;
                return (
                  <div key={s.label} className={`rounded-2xl border p-5 ${cls}`}>
                    <Icon className="h-5 w-5 mb-3 opacity-70" />
                    <p className="text-2xl font-black">{loading ? "…" : s.value}</p>
                    <p className="text-xs font-medium mt-1 opacity-70">{s.label}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Patient flow reminder */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-brand" /> Patient Flow Today
          </h2>
          <div className="flex items-center gap-2 flex-wrap text-sm">
            {[
              "1. Front Desk (Register + Vitals)",
              "2. Accounts (Consultation Fee)",
              "3. VA Room (Vision Assessment)",
              "4. Doctor (Consult)",
              "5a. Pharmacy",
              "5b. Scan Room → Doctor",
              "5c. Theatre → Accounts → Theatre",
            ].map((step, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className={`px-3 py-1.5 rounded-xl font-medium ${i === 0 ? "brand-gradient text-white" : "bg-gray-100 text-gray-600"}`}>
                  {step}
                </span>
                {i < 6 && i !== 3 && <span className="text-gray-300">→</span>}
                {i === 3 && <span className="text-gray-300">→</span>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </StaffLayout>
  );
}
