"use client";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Activity, Search } from "lucide-react";
import { calcBMI, bmiCategory } from "@/lib/utils";
import type { Visit } from "@/lib/types";

interface Props {
  visitId: string | null;
  onSelectVisit: (id: string) => void;
  onSaved: () => void;
}

export default function VitalsForm({ visitId, onSelectVisit, onSaved }: Props) {
  const [visits, setVisits]   = useState<(Visit & { first_name: string; last_name: string; tally_number: string })[]>([]);
  const [form, setForm]       = useState({ weight_kg:"", height_cm:"", bp_systolic:"", bp_diastolic:"", pulse_bpm:"", temperature_c:"", spo2_percent:"", blood_sugar:"", notes:"" });
  const [saving, setSaving]   = useState(false);

  useEffect(() => {
    fetch("/api/visits?date=today&status=registered")
      .then(r => r.json()).then(d => setVisits(d.visits || []));
  }, []);

  const bmi = form.weight_kg && form.height_cm
    ? calcBMI(parseFloat(form.weight_kg), parseFloat(form.height_cm))
    : null;

  const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));

  const handleSave = async () => {
    if (!visitId) { toast.error("Select a patient visit first."); return; }
    setSaving(true);
    const payload: Record<string, unknown> = { visit_id: visitId };
    Object.entries(form).forEach(([k, v]) => { if (v !== "") payload[k] = parseFloat(v) || v; });
    const res = await fetch("/api/vitals", { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify(payload) });
    setSaving(false);
    if (res.ok) onSaved();
    else toast.error("Failed to save vitals.");
  };

  const FIELDS = [
    { key:"weight_kg",    label:"Weight (kg)",    step:"0.1",  min:"0",  max:"300" },
    { key:"height_cm",    label:"Height (cm)",    step:"0.5",  min:"0",  max:"250" },
    { key:"bp_systolic",  label:"BP Systolic",    step:"1",    min:"40", max:"300" },
    { key:"bp_diastolic", label:"BP Diastolic",   step:"1",    min:"20", max:"200" },
    { key:"pulse_bpm",    label:"Pulse (bpm)",    step:"1",    min:"20", max:"250" },
    { key:"temperature_c",label:"Temp (°C)",      step:"0.1",  min:"30", max:"45"  },
    { key:"spo2_percent", label:"SpO₂ (%)",       step:"1",    min:"50", max:"100" },
    { key:"blood_sugar",  label:"Blood Sugar (mmol/L)", step:"0.1", min:"0", max:"50" },
  ];

  return (
    <div className="space-y-6">
      {/* Select visit */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5">
        <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
          <Search className="h-4 w-4 text-brand" /> Select Patient Visit
        </h3>
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {visits.length === 0 && <p className="text-gray-500 text-sm py-4 text-center">No registered patients waiting.</p>}
          {visits.map(v => (
            <button key={v.id} onClick={() => onSelectVisit(v.id)}
              className={`w-full text-left flex items-center justify-between p-3 rounded-xl border transition-all text-sm ${visitId === v.id ? "border-brand bg-brand-50" : "border-gray-100 hover:border-brand-200"}`}>
              <div>
                <span className="font-semibold text-gray-900">#{v.tally_number}</span>
                <span className="ml-3 text-gray-700">{v.first_name} {v.last_name}</span>
              </div>
              {v.is_express && <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full font-semibold">Express</span>}
            </button>
          ))}
        </div>
      </div>

      {/* Vitals form */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5">
        <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Activity className="h-4 w-4 text-brand" /> Record Vitals
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          {FIELDS.map(f => (
            <div key={f.key}>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">{f.label}</label>
              <input type="number" step={f.step} min={f.min} max={f.max}
                value={form[f.key as keyof typeof form]} onChange={e => set(f.key, e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-brand" />
            </div>
          ))}
        </div>
        {bmi && (
          <div className="mb-4 p-3 bg-brand-50 rounded-xl flex items-center gap-3 text-sm">
            <span className="font-bold text-brand">BMI: {bmi}</span>
            <span className="text-gray-600">— {bmiCategory(bmi)}</span>
          </div>
        )}
        <textarea value={form.notes} onChange={e => set("notes", e.target.value)}
          placeholder="Additional notes…"
          className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm mb-4 resize-none focus:outline-none focus:border-brand"
          rows={2} />
        <button onClick={handleSave} disabled={saving || !visitId}
          className="brand-gradient text-white px-8 py-3 rounded-xl font-bold text-sm disabled:opacity-60">
          {saving ? "Saving…" : "Save Vitals & Advance to Accounts"}
        </button>
      </div>
    </div>
  );
}
