"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Calendar, Clock, Video, ArrowLeft, Plus, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { formatDate } from "@/lib/utils";

export default function AppointmentsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [appointments, setAppts] = useState<{ id: string; appointment_date: string; appointment_time: string; type: string; status: string; is_telemedicine: boolean; reason: string }[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving]     = useState(false);
  const [form, setForm]         = useState({
    appointment_date: "", appointment_time: "", type: "consultation",
    reason: "", is_telemedicine: false
  });

  useEffect(() => {
    if (status === "unauthenticated") router.push("/portal/login");
  }, [status, router]);

  useEffect(() => {
    fetch("/api/portal/appointments").then(r => r.json()).then(d => setAppts(d.appointments || []));
  }, []);

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.appointment_date || !form.appointment_time) { toast.error("Select date and time."); return; }
    setSaving(true);
    const res = await fetch("/api/portal/appointments", {
      method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify(form)
    });
    setSaving(false);
    if (res.ok) {
      toast.success("Appointment requested! We will confirm shortly.");
      setShowForm(false);
      fetch("/api/portal/appointments").then(r => r.json()).then(d => setAppts(d.appointments || []));
    } else toast.error("Failed to book appointment.");
  };

  const set = (k: string, v: string | boolean) => setForm(p => ({ ...p, [k]: v }));

  const TIMES = ["08:00","08:30","09:00","09:30","10:00","10:30","11:00","11:30","12:00","14:00","14:30","15:00","15:30","16:00","16:30"];

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-6 h-16 flex items-center gap-4">
          <Link href="/portal/dashboard" className="text-gray-400 hover:text-brand"><ArrowLeft className="h-5 w-5" /></Link>
          <h1 className="font-bold text-gray-900">My Appointments</h1>
          <button onClick={() => setShowForm(true)}
            className="ml-auto flex items-center gap-1.5 brand-gradient text-white px-4 py-2 rounded-xl text-sm font-semibold">
            <Plus className="h-4 w-4" /> Book
          </button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-8 space-y-5">
        {/* Book form */}
        {showForm && (
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h2 className="font-bold text-gray-900 mb-5 flex items-center gap-2"><Calendar className="h-5 w-5 text-brand" /> Book Appointment</h2>
            <form onSubmit={handleBook} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Date</label>
                  <input type="date" value={form.appointment_date} onChange={e => set("appointment_date", e.target.value)}
                    min={new Date().toISOString().split("T")[0]} required
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-brand" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Time</label>
                  <select value={form.appointment_time} onChange={e => set("appointment_time", e.target.value)} required
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-brand bg-white">
                    <option value="">Select…</option>
                    {TIMES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Type</label>
                <select value={form.type} onChange={e => set("type", e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-brand bg-white">
                  <option value="consultation">Consultation</option>
                  <option value="follow_up">Follow-up</option>
                  <option value="surgery">Pre-surgery Assessment</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Reason (optional)</label>
                <textarea value={form.reason} onChange={e => set("reason", e.target.value)}
                  rows={2} placeholder="Briefly describe your reason for visiting…"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-brand resize-none" />
              </div>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={form.is_telemedicine} onChange={e => set("is_telemedicine", e.target.checked)}
                  className="w-4 h-4 accent-brand" />
                <div>
                  <p className="text-sm font-semibold text-gray-700 flex items-center gap-2"><Video className="h-4 w-4 text-blue-500" /> Telemedicine (video consultation)</p>
                  <p className="text-xs text-gray-500">Doctor attends remotely — staff present at clinic</p>
                </div>
              </label>
              <div className="flex gap-3">
                <button type="button" onClick={() => setShowForm(false)}
                  className="flex-1 border border-gray-200 text-gray-600 py-3 rounded-xl text-sm font-semibold">Cancel</button>
                <button type="submit" disabled={saving}
                  className="flex-1 brand-gradient text-white py-3 rounded-xl text-sm font-bold disabled:opacity-60">
                  {saving ? "Booking…" : "Request Appointment"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Appointments list */}
        {appointments.length === 0 && !showForm && (
          <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
            <Calendar className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p className="text-gray-500 mb-4">No appointments yet.</p>
            <button onClick={() => setShowForm(true)} className="brand-gradient text-white px-6 py-3 rounded-xl text-sm font-bold">
              Book Your First Appointment
            </button>
          </div>
        )}

        {appointments.map(a => (
          <div key={a.id} className="bg-white rounded-2xl border border-gray-100 p-5 flex items-start gap-4">
            <div className="w-12 h-12 brand-gradient rounded-2xl flex flex-col items-center justify-center text-white flex-shrink-0">
              <p className="text-[10px] font-bold uppercase">{new Date(a.appointment_date).toLocaleString("en",{month:"short"})}</p>
              <p className="text-xl font-black leading-none">{new Date(a.appointment_date).getDate()}</p>
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <p className="font-semibold text-gray-900 capitalize">{a.type?.replace("_"," ")}</p>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${a.status === "confirmed" ? "bg-green-100 text-green-700" : a.status === "cancelled" ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-700"}`}>
                  {a.status}
                </span>
              </div>
              <p className="text-gray-500 text-sm flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" /> {a.appointment_time?.slice(0,5)}</p>
              {a.is_telemedicine && <p className="text-blue-600 text-xs flex items-center gap-1 mt-1"><Video className="h-3 w-3" /> Telemedicine</p>}
              {a.reason && <p className="text-gray-400 text-xs mt-1">{a.reason}</p>}
            </div>
          </div>
        ))}
      </main>
    </div>
  );
}
