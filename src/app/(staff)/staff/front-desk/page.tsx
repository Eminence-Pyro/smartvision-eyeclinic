"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { UserPlus, Activity, List, Clock } from "lucide-react";
import StaffLayout from "@/components/staff/StaffLayout";
import PatientSearchRegister from "@/components/staff/PatientSearchRegister";
import VitalsForm from "@/components/staff/VitalsForm";
import QueuePanel from "@/components/staff/QueuePanel";

type Tab = "register" | "vitals" | "queue";

export default function FrontDeskPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [tab, setTab]             = useState<Tab>("register");
  const [selectedVisit, setVisit] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/staff/login");
    const role = (session?.user as { role?: string })?.role;
    if (status === "authenticated" && role && !["admin","front_desk"].includes(role)) {
      toast.error("Access denied."); router.push("/staff/dashboard");
    }
  }, [session, status, router]);

  const TABS = [
    { id:"register" as Tab, label:"Register Patient", icon:UserPlus },
    { id:"vitals"   as Tab, label:"Record Vitals",    icon:Activity  },
    { id:"queue"    as Tab, label:"Today's Queue",   icon:List      },
  ];

  return (
    <StaffLayout>
      {/* Page header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-bold text-2xl text-gray-900">Front Desk</h1>
            <p className="text-gray-500 text-sm mt-0.5">
              Patient registration &amp; vitals ·{" "}
              {new Date().toLocaleDateString("en-NG",{weekday:"long",year:"numeric",month:"long",day:"numeric"})}
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-400 bg-white border border-gray-100 rounded-xl px-3 py-2">
            <Clock className="h-4 w-4" />
            <span suppressHydrationWarning>{new Date().toLocaleTimeString("en-NG")}</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {TABS.map(t => {
          const Icon = t.icon;
          return (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                tab === t.id ? "brand-gradient text-white shadow" : "bg-white text-gray-600 border border-gray-200 hover:border-brand hover:text-brand"
              }`}>
              <Icon className="h-4 w-4" /> {t.label}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      {tab === "register" && (
        <PatientSearchRegister
          onVisitCreated={(visitId) => { setVisit(visitId); setTab("vitals"); }}
        />
      )}
      {tab === "vitals" && (
        <VitalsForm
          preSelectedVisitId={selectedVisit}
          onSaved={() => setTab("queue")}
        />
      )}
      {tab === "queue" && <QueuePanel />}
    </StaffLayout>
  );
}
