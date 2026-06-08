"use client";
import PortalFooter from "@/components/ui/PortalFooter";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Eye, Calendar, FileText, Pill, MessageCircle, Video, LogOut, Clock, ChevronRight, User, Bell } from "lucide-react";
import { formatDate, formatCurrency, VISIT_STATUS_LABELS, VISIT_STATUS_COLORS } from "@/lib/utils";

export default function PatientDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [visits, setVisits]       = useState<{ id: string; visit_date: string; status: string; chief_complaint: string; tally_number: string }[]>([]);
  const [appointments, setAppts]  = useState<{ id: string; appointment_date: string; appointment_time: string; type: string; status: string; is_telemedicine: boolean }[]>([]);
  const [prescriptions, setRx]    = useState<{ id: string; drug_name: string; dosage: string; frequency: string; duration: string; dispensed: boolean; created_at: string }[]>([]);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/portal/login");
    if (status === "authenticated") {
      const role = (session?.user as { role?: string })?.role;
      if (role !== "patient") router.push("/staff/dashboard");
    }
  }, [session, status, router]);

  useEffect(() => {
    if (status !== "authenticated" || !(session?.user as { id?: string })?.id) return;
    fetch("/api/portal/visits").then(r => r.json()).then(d => setVisits(d.visits || [])).catch(()=>{});
    fetch("/api/portal/appointments").then(r => r.json()).then(d => setAppts(d.appointments || [])).catch(()=>{});
    fetch("/api/portal/prescriptions").then(r => r.json()).then(d => setRx(d.prescriptions || [])).catch(()=>{});
  }, [status, session]);

  const name = session?.user?.name || "Patient";
  const activeVisit = visits.find(v => v.status !== "completed" && v.status !== "cancelled");

  const QUICK_LINKS = [
    { href:"/portal/appointments", icon: Calendar,    label:"Book Appointment",  color:"bg-brand-100 text-brand"      },
    { href:"/portal/records",      icon: FileText,    label:"Medical Records",   color:"bg-blue-100 text-blue-600"    },
    { href:"/portal/medications",  icon: Pill,        label:"My Medications",    color:"bg-purple-100 text-purple-600"},
    { href:"/portal/chat",         icon: MessageCircle,label:"Chat / Telemedicine",color:"bg-green-100 text-green-600"},
    { href:"/portal/settings",     icon: User,        label:"Account Settings",  color:"bg-gray-100 text-gray-600"   },
  ];

  if (status === "loading") {
    return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand" /></div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 brand-gradient rounded-xl flex items-center justify-center">
              <Eye className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="font-bold text-gray-900 text-sm leading-none">Patient Portal</p>
              <p className="text-gray-400 text-xs">Anya Specialist Eye Clinic</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Bell className="h-5 w-5 text-gray-400" />
            <button onClick={() => signOut({ callbackUrl: "/portal/login" })} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-red-500">
              <LogOut className="h-4 w-4" /> Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8 space-y-8">
        {/* Welcome */}
        <div className="brand-gradient rounded-3xl p-8 text-white relative overflow-hidden">
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage:"radial-gradient(circle at 80% 20%, white 0%, transparent 60%)" }} />
          <div className="relative z-10">
            <p className="text-brand-100 text-sm mb-1">Welcome back</p>
            <h1 className="font-serif font-black text-3xl mb-2">{name}</h1>
            {activeVisit ? (
              <div className="mt-4 bg-white/15 rounded-2xl px-5 py-4 inline-flex items-center gap-3">
                <div className="w-2.5 h-2.5 rounded-full bg-green-300 animate-pulse" />
                <div>
                  <p className="font-semibold text-sm">Active Visit Today</p>
                  <p className="text-brand-100 text-xs capitalize">{VISIT_STATUS_LABELS[activeVisit.status] || activeVisit.status}</p>
                </div>
              </div>
            ) : (
              <p className="text-brand-100 mt-2 text-sm">No active visit today.</p>
            )}
          </div>
        </div>

        {/* Quick links */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {QUICK_LINKS.map(l => {
            const Icon = l.icon;
            return (
              <Link key={l.href} href={l.href}
                className="bg-white rounded-2xl border border-gray-100 p-5 flex flex-col items-center gap-3 text-center card-hover group">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${l.color}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <p className="text-gray-700 font-semibold text-sm leading-tight group-hover:text-brand">{l.label}</p>
              </Link>
            );
          })}
        </div>

        {/* Recent visits */}
        <div className="bg-white rounded-2xl border border-gray-200">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h2 className="font-bold text-gray-900">Recent Visits</h2>
            <Link href="/portal/records" className="text-brand text-sm font-medium hover:underline flex items-center gap-1">
              View all <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="divide-y divide-gray-50">
            {visits.length === 0 && <p className="text-gray-400 text-sm text-center py-8">No visits recorded yet.</p>}
            {visits.slice(0, 5).map(v => (
              <div key={v.id} className="flex items-center gap-4 px-6 py-4">
                <div className="w-10 h-10 bg-brand-50 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Eye className="h-4 w-4 text-brand" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900 text-sm">{formatDate(v.visit_date)}</p>
                  <p className="text-gray-500 text-xs">{v.chief_complaint || "General consultation"}</p>
                </div>
                <span className={`status-badge ${VISIT_STATUS_COLORS[v.status] || "bg-gray-100 text-gray-500"}`}>
                  {VISIT_STATUS_LABELS[v.status] || v.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming appointments */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl border border-gray-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="font-bold text-gray-900">Appointments</h2>
              <Link href="/portal/appointments" className="text-brand text-sm font-medium">Book new</Link>
            </div>
            <div className="divide-y divide-gray-50">
              {appointments.length === 0 && <p className="text-gray-400 text-sm text-center py-6">No appointments booked.</p>}
              {appointments.slice(0, 3).map(a => (
                <div key={a.id} className="flex items-center gap-3 px-6 py-3.5">
                  <Calendar className="h-4 w-4 text-brand flex-shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{formatDate(a.appointment_date)} at {a.appointment_time?.slice(0,5)}</p>
                    <p className="text-xs text-gray-500 capitalize">{a.type} {a.is_telemedicine ? "· Telemedicine 📹" : ""}</p>
                  </div>
                  <span className={`ml-auto text-xs px-2 py-0.5 rounded-full font-medium ${a.status === "confirmed" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                    {a.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Active prescriptions */}
          <div className="bg-white rounded-2xl border border-gray-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="font-bold text-gray-900">Active Medications</h2>
              <Link href="/portal/medications" className="text-brand text-sm font-medium">View all</Link>
            </div>
            <div className="divide-y divide-gray-50">
              {prescriptions.length === 0 && <p className="text-gray-400 text-sm text-center py-6">No active medications.</p>}
              {prescriptions.filter(p => !p.dispensed).slice(0, 3).map(p => (
                <div key={p.id} className="flex items-start gap-3 px-6 py-3.5">
                  <Pill className="h-4 w-4 text-purple-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{p.drug_name}</p>
                    <p className="text-xs text-gray-500">{p.dosage} · {p.frequency} · {p.duration}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
      <PortalFooter />
    </div>
  );
}
