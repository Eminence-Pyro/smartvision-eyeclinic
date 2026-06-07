"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Stethoscope, FileText, Pill, Camera, Scissors, Search, ChevronDown, ChevronUp, Save } from "lucide-react";
import StaffLayout from "@/components/staff/StaffLayout";
import { formatDate, SCAN_TYPE_LABELS, SURGERY_TYPE_LABELS } from "@/lib/utils";

export default function DoctorPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [tab, setTab]             = useState<"queue"|"notes"|"rx"|"scan"|"surgery">("queue");
  const [visits, setVisits]       = useState<{ id: string; first_name: string; last_name: string; tally_number: string; patient_id: string; patient_number: string; chief_complaint: string }[]>([]);
  const [selectedVisit, setSelected] = useState<typeof visits[0] | null>(null);
  const [vitals, setVitals]       = useState<Record<string, unknown> | null>(null);
  const [va, setVa]               = useState<Record<string, unknown> | null>(null);
  const [saving, setSaving]       = useState(false);

  // Clinical notes form
  const [notes, setNotes]         = useState({
    history_presenting_complaint:"", past_ocular_history:"", past_medical_history:"",
    family_history:"", drug_history:"", social_history:"",
    anterior_segment_right:"", anterior_segment_left:"",
    posterior_segment_right:"", posterior_segment_left:"",
    diagnosis_right:"", diagnosis_left:"", icd_codes:"",
    management_plan:"", follow_up_date:"", follow_up_notes:""
  });

  // Prescriptions
  const [rxList, setRxList]       = useState<{ drug_name: string; dosage: string; frequency: string; duration: string; route: string; eye_side: string; instructions: string; quantity: string }[]>([
    { drug_name:"", dosage:"", frequency:"", duration:"", route:"oral", eye_side:"", instructions:"", quantity:"" }
  ]);

  // Scan booking
  const [scanForm, setScanForm]   = useState({ type:"oct_macular", eye_side:"both", indication:"" });

  // Surgery booking
  const [surgForm, setSurgForm]   = useState({ type:"phacoemulsification", eye_side:"right", indication:"", preop_notes:"" });

  useEffect(() => {
    if (status === "unauthenticated") router.push("/staff/login");
    const role = (session?.user as { role?: string })?.role;
    if (status === "authenticated" && role && !["admin","doctor"].includes(role)) {
      toast.error("Access denied."); router.push("/staff/dashboard");
    }
  }, [session, status, router]);

  useEffect(() => {
    fetch("/api/visits?date=today&status=awaiting_doctor")
      .then(r => r.json()).then(d => setVisits(d.visits || []));
  }, []);

  const selectVisit = async (v: typeof visits[0]) => {
    setSelected(v);
    setTab("notes");
    // Load existing vitals and VA
    const [vr, var_] = await Promise.all([
      fetch(`/api/vitals?visit_id=${v.id}`).then(r => r.json()),
      fetch(`/api/va?visit_id=${v.id}`).then(r => r.json()),
    ]);
    setVitals(vr.vitals || null);
    setVa(var_.assessment || null);
  };

  const saveNotes = async () => {
    if (!selectedVisit) return;
    setSaving(true);
    const res = await fetch("/api/clinical-notes", {
      method:"POST", headers:{"Content-Type":"application/json"},
      body: JSON.stringify({ visit_id: selectedVisit.id, ...notes })
    });
    setSaving(false);
    if (res.ok) toast.success("Clinical notes saved.");
    else toast.error("Failed to save notes.");
  };

  const saveRx = async () => {
    if (!selectedVisit) return;
    const valid = rxList.filter(r => r.drug_name.trim());
    if (!valid.length) { toast.error("Add at least one medication."); return; }
    setSaving(true);
    const res = await fetch("/api/prescriptions", {
      method:"POST", headers:{"Content-Type":"application/json"},
      body: JSON.stringify({ visit_id: selectedVisit.id, prescriptions: valid })
    });
    setSaving(false);
    if (res.ok) toast.success("Prescriptions saved. Patient can proceed to pharmacy.");
    else toast.error("Failed to save prescriptions.");
  };

  const bookScan = async () => {
    if (!selectedVisit) return;
    setSaving(true);
    const res = await fetch("/api/scans/book", {
      method:"POST", headers:{"Content-Type":"application/json"},
      body: JSON.stringify({ visit_id: selectedVisit.id, patient_id: selectedVisit.patient_id, ...scanForm })
    });
    setSaving(false);
    if (res.ok) toast.success("Scan booked. Patient to proceed to accounts then scan room.");
    else toast.error("Failed to book scan.");
  };

  const bookSurgery = async () => {
    if (!selectedVisit) return;
    setSaving(true);
    const res = await fetch("/api/surgeries/book", {
      method:"POST", headers:{"Content-Type":"application/json"},
      body: JSON.stringify({ visit_id: selectedVisit.id, patient_id: selectedVisit.patient_id, ...surgForm })
    });
    setSaving(false);
    if (res.ok) toast.success("Surgery booked. Patient to proceed to theatre then accounts.");
    else toast.error("Failed to book surgery.");
  };

  const addRx = () => setRxList(r => [...r, { drug_name:"", dosage:"", frequency:"", duration:"", route:"oral", eye_side:"", instructions:"", quantity:"" }]);
  const removeRx = (i: number) => setRxList(r => r.filter((_, idx) => idx !== i));
  const updateRx = (i: number, k: string, v: string) => setRxList(r => r.map((rx, idx) => idx === i ? { ...rx, [k]: v } : rx));

  const TABS = [
    { id:"queue",   label:"Patient Queue",    icon:Stethoscope },
    { id:"notes",   label:"Clinical Notes",   icon:FileText    },
    { id:"rx",      label:"Prescriptions",    icon:Pill        },
    { id:"scan",    label:"Book Scan",        icon:Camera      },
    { id:"surgery", label:"Book Surgery",     icon:Scissors    },
  ];

  return (
    <StaffLayout>
      <div className="max-w-6xl mx-auto">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h1 className="font-bold text-2xl text-gray-900">Doctor's Office</h1>
            <p className="text-gray-500 text-sm">Clinical notes · Prescriptions · Scan & Surgery booking</p>
          </div>
          {selectedVisit && (
            <div className="bg-brand-50 border border-brand-200 rounded-xl px-4 py-2 text-sm">
              <span className="text-brand font-bold">#{selectedVisit.tally_number}</span>
              <span className="ml-2 text-gray-700 font-semibold">{selectedVisit.first_name} {selectedVisit.last_name}</span>
              <button onClick={() => { setSelected(null); setTab("queue"); }} className="ml-3 text-gray-400 hover:text-red-500 text-xs">✕</button>
            </div>
          )}
        </div>

        <div className="flex gap-2 mb-6 flex-wrap">
          {TABS.map(t => {
            const Icon = t.icon;
            return (
              <button key={t.id} onClick={() => setTab(t.id as typeof tab)}
                disabled={t.id !== "queue" && !selectedVisit}
                className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-40 ${tab === t.id ? "brand-gradient text-white shadow" : "bg-white text-gray-600 border border-gray-200 hover:border-brand"}`}>
                <Icon className="h-4 w-4" /> {t.label}
              </button>
            );
          })}
        </div>

        {/* ── QUEUE ── */}
        {tab === "queue" && (
          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <h3 className="font-bold text-gray-900 mb-4">Patients Awaiting Doctor</h3>
            <div className="space-y-2">
              {visits.length === 0 && <p className="text-gray-400 text-center py-8 text-sm">No patients awaiting doctor.</p>}
              {visits.map(v => (
                <button key={v.id} onClick={() => selectVisit(v)}
                  className="w-full text-left p-4 rounded-xl border border-gray-100 hover:border-brand hover:bg-brand-50 transition-all flex items-center gap-4">
                  <div className="w-10 h-10 brand-gradient rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                    {String(v.tally_number).padStart(3,"0")}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">{v.first_name} {v.last_name}</p>
                    <p className="text-gray-500 text-xs">{v.patient_number} · {v.chief_complaint || "No complaint recorded"}</p>
                  </div>
                  <span className="text-brand text-sm font-semibold">Open →</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── PATIENT SUMMARY BAR (when selected) ── */}
        {selectedVisit && tab !== "queue" && (
          <div className="bg-white rounded-2xl border border-gray-200 p-4 mb-5">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              {vitals && (
                <>
                  <div><p className="text-xs text-gray-500 font-semibold">BP</p><p className="font-bold text-gray-900">{(vitals.bp_systolic as number) || "—"}/{(vitals.bp_diastolic as number) || "—"} mmHg</p></div>
                  <div><p className="text-xs text-gray-500 font-semibold">Pulse</p><p className="font-bold text-gray-900">{(vitals.pulse_bpm as number) || "—"} bpm</p></div>
                  <div><p className="text-xs text-gray-500 font-semibold">Weight/BMI</p><p className="font-bold text-gray-900">{(vitals.weight_kg as number) || "—"} kg · BMI {(vitals.bmi as number) || "—"}</p></div>
                  <div><p className="text-xs text-gray-500 font-semibold">Temp / SpO₂</p><p className="font-bold text-gray-900">{(vitals.temperature_c as number) || "—"}°C · {(vitals.spo2_percent as number) || "—"}%</p></div>
                </>
              )}
              {va && (
                <>
                  <div><p className="text-xs text-gray-500 font-semibold">VA Right</p><p className="font-bold text-gray-900">{(va.va_right_unaided as string) || "—"} / {(va.va_right_ph as string) || "—"} PH</p></div>
                  <div><p className="text-xs text-gray-500 font-semibold">VA Left</p><p className="font-bold text-gray-900">{(va.va_left_unaided as string) || "—"} / {(va.va_left_ph as string) || "—"} PH</p></div>
                  <div><p className="text-xs text-gray-500 font-semibold">IOP</p><p className="font-bold text-gray-900">R: {(va.iop_right as number) || "—"} · L: {(va.iop_left as number) || "—"} mmHg</p></div>
                  <div><p className="text-xs text-gray-500 font-semibold">Complaint</p><p className="font-bold text-gray-900 truncate">{selectedVisit.chief_complaint || "—"}</p></div>
                </>
              )}
            </div>
          </div>
        )}

        {/* ── CLINICAL NOTES ── */}
        {tab === "notes" && selectedVisit && (
          <div className="bg-white rounded-2xl border border-gray-200 p-5 space-y-5">
            <h3 className="font-bold text-gray-900 flex items-center gap-2"><FileText className="h-4 w-4 text-brand" /> Clinical Notes</h3>

            {/* History */}
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">History</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { k:"history_presenting_complaint", label:"History of Presenting Complaint", rows:3 },
                  { k:"past_ocular_history",          label:"Past Ocular History", rows:2 },
                  { k:"past_medical_history",         label:"Past Medical History", rows:2 },
                  { k:"family_history",               label:"Family History", rows:2 },
                  { k:"drug_history",                 label:"Drug History", rows:2 },
                  { k:"social_history",               label:"Social History", rows:2 },
                ].map(f => (
                  <div key={f.k} className={f.rows === 3 ? "md:col-span-2" : ""}>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">{f.label}</label>
                    <textarea value={notes[f.k as keyof typeof notes]} onChange={e => setNotes(n => ({ ...n, [f.k]: e.target.value }))}
                      rows={f.rows} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-brand resize-none" />
                  </div>
                ))}
              </div>
            </div>

            {/* Examination */}
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Examination</p>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { k:"anterior_segment_right",  label:"Anterior Segment — Right" },
                  { k:"anterior_segment_left",   label:"Anterior Segment — Left"  },
                  { k:"posterior_segment_right", label:"Posterior Segment — Right" },
                  { k:"posterior_segment_left",  label:"Posterior Segment — Left"  },
                ].map(f => (
                  <div key={f.k}>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">{f.label}</label>
                    <textarea value={notes[f.k as keyof typeof notes]} onChange={e => setNotes(n => ({ ...n, [f.k]: e.target.value }))}
                      rows={3} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-brand resize-none" />
                  </div>
                ))}
              </div>
            </div>

            {/* Diagnosis */}
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Diagnosis & Plan</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Diagnosis — Right Eye</label>
                  <input value={notes.diagnosis_right} onChange={e => setNotes(n => ({ ...n, diagnosis_right: e.target.value }))}
                    placeholder="e.g. PSCC Cataract"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-brand" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Diagnosis — Left Eye</label>
                  <input value={notes.diagnosis_left} onChange={e => setNotes(n => ({ ...n, diagnosis_left: e.target.value }))}
                    placeholder="e.g. POAG"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-brand" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">ICD-10 Codes</label>
                  <input value={notes.icd_codes} onChange={e => setNotes(n => ({ ...n, icd_codes: e.target.value }))}
                    placeholder="H26.1, H40.1…"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-brand" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Follow-up Date</label>
                  <input type="date" value={notes.follow_up_date} onChange={e => setNotes(n => ({ ...n, follow_up_date: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-brand" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Management Plan</label>
                  <textarea value={notes.management_plan} onChange={e => setNotes(n => ({ ...n, management_plan: e.target.value }))}
                    rows={3} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-brand resize-none" />
                </div>
              </div>
            </div>

            <button onClick={saveNotes} disabled={saving}
              className="flex items-center gap-2 brand-gradient text-white px-8 py-3 rounded-xl font-bold text-sm disabled:opacity-60">
              <Save className="h-4 w-4" /> {saving ? "Saving…" : "Save Clinical Notes"}
            </button>
          </div>
        )}

        {/* ── PRESCRIPTIONS ── */}
        {tab === "rx" && selectedVisit && (
          <div className="bg-white rounded-2xl border border-gray-200 p-5 space-y-4">
            <h3 className="font-bold text-gray-900 flex items-center gap-2"><Pill className="h-4 w-4 text-brand" /> Prescriptions</h3>
            {rxList.map((rx, i) => (
              <div key={i} className="border border-gray-100 rounded-xl p-4 relative">
                <button onClick={() => removeRx(i)} className="absolute top-3 right-3 text-gray-400 hover:text-red-500 text-xs">✕</button>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-gray-500 mb-1">Drug Name *</label>
                    <input value={rx.drug_name} onChange={e => updateRx(i, "drug_name", e.target.value)}
                      placeholder="e.g. Timolol 0.5% eye drops"
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-brand" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">Dosage</label>
                    <input value={rx.dosage} onChange={e => updateRx(i, "dosage", e.target.value)}
                      placeholder="e.g. 1 drop"
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-brand" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">Frequency</label>
                    <input value={rx.frequency} onChange={e => updateRx(i, "frequency", e.target.value)}
                      placeholder="e.g. BD, TDS, QID"
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-brand" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">Duration</label>
                    <input value={rx.duration} onChange={e => updateRx(i, "duration", e.target.value)}
                      placeholder="e.g. 4 weeks"
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-brand" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">Route</label>
                    <select value={rx.route} onChange={e => updateRx(i, "route", e.target.value)}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-brand bg-white">
                      {["topical","oral","IV","IM","subconjunctival"].map(r => <option key={r}>{r}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">Eye Side</label>
                    <select value={rx.eye_side} onChange={e => updateRx(i, "eye_side", e.target.value)}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-brand bg-white">
                      <option value="">N/A</option>
                      <option value="right">Right</option>
                      <option value="left">Left</option>
                      <option value="both">Both</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">Qty</label>
                    <input type="number" value={rx.quantity} onChange={e => updateRx(i, "quantity", e.target.value)}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-brand" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-gray-500 mb-1">Instructions</label>
                    <input value={rx.instructions} onChange={e => updateRx(i, "instructions", e.target.value)}
                      placeholder="e.g. Apply at bedtime. Shake well before use."
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-brand" />
                  </div>
                </div>
              </div>
            ))}
            <div className="flex gap-3">
              <button onClick={addRx} className="border border-brand text-brand px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-brand-50">+ Add Drug</button>
              <button onClick={saveRx} disabled={saving}
                className="brand-gradient text-white px-8 py-2.5 rounded-xl text-sm font-bold disabled:opacity-60">
                {saving ? "Saving…" : "Save Prescriptions → Pharmacy"}
              </button>
            </div>
          </div>
        )}

        {/* ── BOOK SCAN ── */}
        {tab === "scan" && selectedVisit && (
          <div className="bg-white rounded-2xl border border-gray-200 p-5 space-y-4">
            <h3 className="font-bold text-gray-900 flex items-center gap-2"><Camera className="h-4 w-4 text-brand" /> Book Investigation / Scan</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Scan Type</label>
                <select value={scanForm.type} onChange={e => setScanForm(s => ({ ...s, type: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-brand bg-white">
                  {Object.entries(SCAN_TYPE_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Eye</label>
                <select value={scanForm.eye_side} onChange={e => setScanForm(s => ({ ...s, eye_side: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-brand bg-white">
                  <option value="right">Right</option>
                  <option value="left">Left</option>
                  <option value="both">Both</option>
                </select>
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Indication</label>
                <textarea value={scanForm.indication} onChange={e => setScanForm(s => ({ ...s, indication: e.target.value }))}
                  rows={2} placeholder="Clinical indication for this investigation…"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-brand resize-none" />
              </div>
            </div>
            <button onClick={bookScan} disabled={saving}
              className="brand-gradient text-white px-8 py-3 rounded-xl font-bold text-sm disabled:opacity-60">
              {saving ? "Booking…" : "Book Scan → Patient to Accounts then Scan Room"}
            </button>
          </div>
        )}

        {/* ── BOOK SURGERY ── */}
        {tab === "surgery" && selectedVisit && (
          <div className="bg-white rounded-2xl border border-gray-200 p-5 space-y-4">
            <h3 className="font-bold text-gray-900 flex items-center gap-2"><Scissors className="h-4 w-4 text-brand" /> Book Surgery</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Surgery Type</label>
                <select value={surgForm.type} onChange={e => setSurgForm(s => ({ ...s, type: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-brand bg-white">
                  {Object.entries(SURGERY_TYPE_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Eye</label>
                <select value={surgForm.eye_side} onChange={e => setSurgForm(s => ({ ...s, eye_side: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-brand bg-white">
                  <option value="right">Right</option>
                  <option value="left">Left</option>
                  <option value="both">Both</option>
                </select>
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Indication</label>
                <textarea value={surgForm.indication} onChange={e => setSurgForm(s => ({ ...s, indication: e.target.value }))}
                  rows={2} placeholder="Surgical indication…"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-brand resize-none" />
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Pre-op Notes</label>
                <textarea value={surgForm.preop_notes} onChange={e => setSurgForm(s => ({ ...s, preop_notes: e.target.value }))}
                  rows={2} placeholder="Pre-operative instructions / notes…"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-brand resize-none" />
              </div>
            </div>
            <button onClick={bookSurgery} disabled={saving}
              className="brand-gradient text-white px-8 py-3 rounded-xl font-bold text-sm disabled:opacity-60">
              {saving ? "Booking…" : "Book Surgery → Patient to Theatre then Accounts"}
            </button>
          </div>
        )}
      </div>
    </StaffLayout>
  );
}
