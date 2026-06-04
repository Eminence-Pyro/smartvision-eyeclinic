"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Activity, Search, Save } from "lucide-react";
import StaffLayout from "@/components/staff/StaffLayout";
import QueuePanel from "@/components/staff/QueuePanel";

const VA_OPTIONS = ["6/4","6/5","6/6","6/9","6/12","6/18","6/24","6/36","6/60","3/60","1/60","CF","HM","PL","NPL"];

export default function VARoomPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [tab, setTab]       = useState<"assess"|"queue">("assess");
  const [visitId, setVisitId] = useState("");
  const [visits, setVisits] = useState<{ id: string; first_name: string; last_name: string; tally_number: string; patient_number: string }[]>([]);
  const [saving, setSaving] = useState(false);
  const [form, setForm]     = useState({
    va_right_unaided:"", va_left_unaided:"", va_right_aided:"", va_left_aided:"",
    va_right_ph:"",      va_left_ph:"",
    colour_vision_right:"", colour_vision_left:"",
    iop_right:"", iop_left:"", iop_method:"NCT",
    confrontation_vf:"", cover_test:"", motility:"",
    pupil_right:"", pupil_left:"", notes:""
  });

  useEffect(() => {
    if (status === "unauthenticated") router.push("/staff/login");
    const role = (session?.user as { role?: string })?.role;
    if (status === "authenticated" && role && !["admin","va_room"].includes(role)) {
      toast.error("Access denied."); router.push("/staff/dashboard");
    }
  }, [session, status, router]);

  useEffect(() => {
    fetch("/api/visits?date=today&status=vision_assessment")
      .then(r => r.json()).then(d => setVisits(d.visits || []));
  }, []);

  const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));

  const handleSave = async () => {
    if (!visitId) { toast.error("Select a patient first."); return; }
    setSaving(true);
    const payload: Record<string, unknown> = { visit_id: visitId };
    Object.entries(form).forEach(([k, v]) => { if (v) payload[k] = v; });
    if (form.iop_right) payload.iop_right = parseFloat(form.iop_right);
    if (form.iop_left)  payload.iop_left  = parseFloat(form.iop_left);
    const res = await fetch("/api/vision-assessment", {
      method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify(payload)
    });
    setSaving(false);
    if (res.ok) { toast.success("Vision assessment saved! Patient moved to doctor queue."); setForm({ va_right_unaided:"", va_left_unaided:"", va_right_aided:"", va_left_aided:"", va_right_ph:"", va_left_ph:"", colour_vision_right:"", colour_vision_left:"", iop_right:"", iop_left:"", iop_method:"NCT", confrontation_vf:"", cover_test:"", motility:"", pupil_right:"", pupil_left:"", notes:"" }); setVisitId(""); }
    else toast.error("Failed to save assessment.");
  };

  const VASelect = ({ label, field }: { label: string; field: string }) => (
    <div>
      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">{label}</label>
      <select value={form[field as keyof typeof form]} onChange={e => set(field, e.target.value)}
        className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-brand bg-white">
        <option value="">—</option>
        {VA_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );

  return (
    <StaffLayout>
      <div className="max-w-5xl mx-auto">
        <div className="mb-6">
          <h1 className="font-bold text-2xl text-gray-900">VA Room</h1>
          <p className="text-gray-500 text-sm">Vision Assessment & Intraocular Pressure</p>
        </div>

        <div className="flex gap-2 mb-6">
          {[["assess","Record Assessment"],["queue","Today's Queue"]].map(([id, label]) => (
            <button key={id} onClick={() => setTab(id as "assess"|"queue")}
              className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${tab === id ? "brand-gradient text-white shadow" : "bg-white text-gray-600 border border-gray-200 hover:border-brand"}`}>
              {label}
            </button>
          ))}
        </div>

        {tab === "queue" && <QueuePanel department="va_room" />}

        {tab === "assess" && (
          <div className="space-y-5">
            {/* Select patient */}
            <div className="bg-white rounded-2xl border border-gray-200 p-5">
              <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                <Search className="h-4 w-4 text-brand" /> Select Patient (Awaiting VA)
              </h3>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {visits.length === 0 && <p className="text-gray-400 text-sm text-center py-3">No patients awaiting vision assessment.</p>}
                {visits.map(v => (
                  <button key={v.id} onClick={() => setVisitId(v.id)}
                    className={`w-full text-left flex items-center justify-between p-3 rounded-xl border transition-all text-sm ${visitId === v.id ? "border-brand bg-brand-50" : "border-gray-100 hover:border-brand-200"}`}>
                    <span className="font-semibold text-brand">#{v.tally_number}</span>
                    <span className="text-gray-700 flex-1 ml-3">{v.first_name} {v.last_name}</span>
                    <span className="text-gray-400 text-xs">{v.patient_number}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* VA form */}
            <div className="bg-white rounded-2xl border border-gray-200 p-5">
              <h3 className="font-bold text-gray-900 mb-5 flex items-center gap-2">
                <Activity className="h-4 w-4 text-brand" /> Visual Acuity
              </h3>
              <div className="grid grid-cols-2 gap-6 mb-6">
                {/* Right Eye */}
                <div className="space-y-3">
                  <p className="text-sm font-bold text-red-600 bg-red-50 px-3 py-1.5 rounded-lg text-center">RIGHT EYE (OD)</p>
                  <VASelect label="Unaided VA"  field="va_right_unaided" />
                  <VASelect label="Aided VA"    field="va_right_aided" />
                  <VASelect label="Pinhole VA"  field="va_right_ph" />
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Colour Vision</label>
                    <input value={form.colour_vision_right} onChange={e => set("colour_vision_right", e.target.value)}
                      placeholder="e.g. 15/17 Ishihara"
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-brand" />
                  </div>
                </div>
                {/* Left Eye */}
                <div className="space-y-3">
                  <p className="text-sm font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg text-center">LEFT EYE (OS)</p>
                  <VASelect label="Unaided VA"  field="va_left_unaided" />
                  <VASelect label="Aided VA"    field="va_left_aided" />
                  <VASelect label="Pinhole VA"  field="va_left_ph" />
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Colour Vision</label>
                    <input value={form.colour_vision_left} onChange={e => set("colour_vision_left", e.target.value)}
                      placeholder="e.g. 15/17 Ishihara"
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-brand" />
                  </div>
                </div>
              </div>

              {/* IOP */}
              <h3 className="font-bold text-gray-900 mb-4">Intraocular Pressure (IOP)</h3>
              <div className="grid grid-cols-3 gap-4 mb-5">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">IOP Right (mmHg)</label>
                  <input type="number" step="0.5" min="0" max="80" value={form.iop_right} onChange={e => set("iop_right", e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-brand" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">IOP Left (mmHg)</label>
                  <input type="number" step="0.5" min="0" max="80" value={form.iop_left} onChange={e => set("iop_left", e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-brand" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Method</label>
                  <select value={form.iop_method} onChange={e => set("iop_method", e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-brand bg-white">
                    {["NCT","Goldmann","iCare","Tono-Pen"].map(m => <option key={m}>{m}</option>)}
                  </select>
                </div>
              </div>

              {/* Other findings */}
              <h3 className="font-bold text-gray-900 mb-4">Other Findings</h3>
              <div className="grid grid-cols-2 gap-4 mb-4">
                {[
                  { key:"pupil_right",       label:"Pupil — Right", placeholder:"e.g. 3mm, RAPD-ve" },
                  { key:"pupil_left",        label:"Pupil — Left",  placeholder:"e.g. 3mm, reacting" },
                  { key:"cover_test",        label:"Cover Test",    placeholder:"e.g. orthotropic" },
                  { key:"motility",          label:"Motility",      placeholder:"e.g. full range" },
                ].map(f => (
                  <div key={f.key}>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">{f.label}</label>
                    <input value={form[f.key as keyof typeof form]} onChange={e => set(f.key, e.target.value)}
                      placeholder={f.placeholder}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-brand" />
                  </div>
                ))}
              </div>
              <div className="mb-4">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Confrontation Visual Fields</label>
                <input value={form.confrontation_vf} onChange={e => set("confrontation_vf", e.target.value)}
                  placeholder="e.g. Full to confrontation OU"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-brand" />
              </div>
              <textarea value={form.notes} onChange={e => set("notes", e.target.value)}
                placeholder="Additional notes…" rows={2}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm mb-4 resize-none focus:outline-none focus:border-brand" />

              <button onClick={handleSave} disabled={saving || !visitId}
                className="flex items-center gap-2 brand-gradient text-white px-8 py-3 rounded-xl font-bold text-sm disabled:opacity-60">
                <Save className="h-4 w-4" /> {saving ? "Saving…" : "Save Assessment & Send to Doctor"}
              </button>
            </div>
          </div>
        )}
      </div>
    </StaffLayout>
  );
}
