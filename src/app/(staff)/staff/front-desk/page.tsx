"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { UserPlus, Search, List, Activity, Clock } from "lucide-react";
import PatientSearchRegister from "@/components/staff/PatientSearchRegister";
import VitalsForm from "@/components/staff/VitalsForm";
import QueuePanel from "@/components/staff/QueuePanel";

type Tab = "register" | "vitals" | "queue";

export default function FrontDeskPage() {
  const { data: session, status } = useSession();
  const router   = useRouter();
  const [tab, setTab]               = useState<Tab>("register");
  const [selectedVisit, setVisit]   = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/staff/login");
    const role = (session?.user as { role?: string })?.role;
    if (status === "authenticated" && role && !["admin","front_desk"].includes(role)) {
      toast.error("Access denied.");
      router.push("/staff/dashboard");
    }
  }, [session, status, router]);

  const TABS = [
    { id: "register" as Tab, label: "Register Patient", icon: UserPlus },
    { id: "vitals"   as Tab, label: "Record Vitals",    icon: Activity  },
    { id: "queue"    as Tab, label: "Today's Queue",   icon: List      },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="font-bold text-xl text-gray-900">Front Desk</h1>
            <p className="text-gray-500 text-sm">Patient registration & vitals — {new Date().toLocaleDateString("en-NG", { weekday:"long", year:"numeric", month:"long", day:"numeric" })}</p>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Clock className="h-4 w-4" />
            <span id="clock">{new Date().toLocaleTimeString("en-NG")}</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-6xl mx-auto px-6 py-4">
        <div className="flex gap-2 mb-6">
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

        {tab === "register" && (
          <PatientSearchRegister
            onVisitCreated={(visitId) => { setVisit(visitId); setTab("vitals"); }}
          />
        )}
        {tab === "vitals" && (
          <VitalsForm
            visitId={selectedVisit}
            onSelectVisit={setVisit}
            onSaved={() => { toast.success("Vitals saved!"); setTab("queue"); }}
          />
        )}
        {tab === "queue" && <QueuePanel department="front_desk" />}
      </div>
    </div>
  );
}
