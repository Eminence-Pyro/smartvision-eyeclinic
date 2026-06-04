"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Scissors, Upload, Save } from "lucide-react";
import StaffLayout from "@/components/staff/StaffLayout";
import { SURGERY_TYPE_LABELS } from "@/lib/utils";

export default function TheatrePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [surgeries, setSurgeries] = useState<{ id: string; type: string; eye_side: string; indication: string; visit_id: string; first_name: string; last_name: string; patient_number: string; tally_number: string; preop_notes: string }[]>([]);
  const [selected, setSelected]   = useState<typeof surgeries[0] | null>(null);
  const [bscanUrls, setBscanUrls] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving]       = useState(false);
  const [form, setForm]           = useState({
    anaesthesia:"", lens_brand:"", lens_model:"", lens_power:"", lens_position:"in-the-bag",
    technique_notes:"", complications:"", duration_mins:"",
    postop_va_right:"", postop_va_left:"", postop_iop_right:"", postop_iop_left:"",
    postop_notes:"", preop_tests_done:""
  });

  useEffect(() => {
    if (status === "unauthenticated") router.push("/staff/login");
    const role = (session?.user as { role?: string })?.role;
    if (status === "authenticated" && role && !["admin","theatre"].includes(role)) {
      toast.error("Access denied."); router.push("/staff/dashboard");
    }
  }, [session, status, router]);

  useEffect(() => {
    fetch("/api/surgeries?status=booked&date=today")
      .then(r => r.json()).then(d => setSurgeries(d.surgeries || []));
  }, []);

  const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));

  const uploadBScan = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setUploading(true);
    const uploaded: string[] = [];
    for (const file of files) {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("upload_preset", "smartvision_scans");
      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
        { method:"POST", body: fd }
      );
      const data = await res.json();
      uploaded.push(data.secure_url);
    }
    setBscanUrls(prev => [...prev, ...uploaded]);
    setUploading(false);
    toast.success("B-scan uploaded.");
  };

  const handleSave = async () => {
    if (!selected) return;
    setSaving(true);
    const payload: Record<string, unknown> = { ...form, bscan_urls: bscanUrls };
    if (form.lens_power)      payload.lens_power = parseFloat(form.lens_power);
    if (form.duration_mins)   payload.duration_mins = parseInt(form.duration_mins);
    if (form.postop_iop_right) payload.postop_iop_right = parseFloat(form.postop_iop_right);
    if (form.postop_iop_left)  payload.postop_iop_left  = parseFloat(form.postop_iop_left);
    const res = await fetch(`/api/surgeries/${selected.id}`, {
      method:"PATCH", headers:{"Content-Type":"application/json"}, body: JSON.stringify(payload)
    });
    setSaving(false);
    if (res.ok) toast.success("Surgery record updated.");
    else toast.error("Failed to save surgery record.");
  };

  const ANAESTHESIA = ["Topical","Peribulbar","Retrobulbar","General","Sub-Tenon"];
  const LENS_POSITIONS = ["in-the-bag","sulcus","ACIOL","PCIOL","iris-fixated"];

  return (
    <StaffLayout>
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="font-bold text-2xl text-gray-900">Theatre</h1>
          <p className="text-gray-500 text-sm">Surgery records, B-scan upload, post-op parameters</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Surgery list */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <h3 className="font-bold text-gray-900 mb-4 text-sm">Booked Surgeries</h3>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {surgeries.length === 0 && <p className="text-gray-400 text-xs text-center py-6">No surgeries booked today.</p>}
              {surgeries.map(s => (
                <button key={s.id} onClick={() => setSelected(s)}
                  className={`w-full text-left p-3 rounded-xl border text-sm transition-all ${selected?.id === s.id ? "border-brand bg-brand-50" : "border-gray-100 hover:border-brand-200"}`}>
                  <p className="font-semibold text-gray-900">{s.first_name} {s.last_name}</p>
                  <p className="text-xs text-brand font-medium">{SURGERY_TYPE_LABELS[s.type]} — {s.eye_side}</p>
                  {s.indication && <p className="text-xs text-gray-400 truncate mt-0.5">{s.indication}</p>}
                  {s.preop_notes && (
                    <p className="text-xs text-amber-600 mt-1 bg-amber-50 rounded px-2 py-0.5 truncate">Pre-op: {s.preop_notes}</p>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Surgery form */}
          {selected ? (
            <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 p-5 space-y-5">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-gray-900 flex items-center gap-2">
                  <Scissors className="h-4 w-4 text-brand" />
                  {SURGERY_TYPE_LABELS[selected.type]} — {selected.first_name} {selected.last_name}
                </h3>
                <span className="text-xs text-brand bg-brand-50 px-3 py-1 rounded-full">#{selected.tally_number}</span>
              </div>

              {/* Anaesthesia + Lens */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Anaesthesia</label>
                  <select value={form.anaesthesia} onChange={e => set("anaesthesia", e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-brand bg-white">
                    <option value="">Select…</option>
                    {ANAESTHESIA.map(a => <option key={a}>{a}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Duration (mins)</label>
                  <input type="number" value={form.duration_mins} onChange={e => set("duration_mins", e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-brand" />
                </div>
              </div>

              {/* Lens (for cataract) */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Lens Brand</label>
                  <input value={form.lens_brand} onChange={e => set("lens_brand", e.target.value)}
                    placeholder="e.g. Alcon, Bausch & Lomb"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-brand" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Lens Model</label>
                  <input value={form.lens_model} onChange={e => set("lens_model", e.target.value)}
                    placeholder="e.g. MA60AT"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-brand" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Lens Power (D)</label>
                  <input type="number" step="0.5" value={form.lens_power} onChange={e => set("lens_power", e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-brand" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Lens Position</label>
                  <select value={form.lens_position} onChange={e => set("lens_position", e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-brand bg-white">
                    {LENS_POSITIONS.map(p => <option key={p}>{p}</option>)}
                  </select>
                </div>
              </div>

              {/* Technique + Complications */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Technique Notes</label>
                  <textarea value={form.technique_notes} onChange={e => set("technique_notes", e.target.value)}
                    rows={3} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-brand resize-none" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Complications</label>
                  <textarea value={form.complications} onChange={e => set("complications", e.target.value)}
                    rows={3} placeholder="None / describe complications…"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-brand resize-none" />
                </div>
              </div>

              {/* Post-op VA / IOP */}
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Post-Operative</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { k:"postop_va_right", label:"VA Right (post-op)" },
                    { k:"postop_va_left",  label:"VA Left (post-op)"  },
                    { k:"postop_iop_right",label:"IOP Right (mmHg)"   },
                    { k:"postop_iop_left", label:"IOP Left (mmHg)"    },
                  ].map(f => (
                    <div key={f.k}>
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">{f.label}</label>
                      <input value={form[f.k as keyof typeof form]} onChange={e => set(f.k, e.target.value)}
                        className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-brand" />
                    </div>
                  ))}
                </div>
                <textarea value={form.postop_notes} onChange={e => set("postop_notes", e.target.value)}
                  placeholder="Post-operative notes…" rows={2}
                  className="w-full mt-3 border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-brand resize-none" />
              </div>

              {/* B-scan upload */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">B-Scan / Images</label>
                <label className={`flex items-center gap-3 border-2 border-dashed rounded-xl p-4 cursor-pointer transition-colors ${uploading ? "border-brand bg-brand-50" : "border-gray-200 hover:border-brand"}`}>
                  <Upload className={`h-5 w-5 ${uploading ? "text-brand animate-bounce" : "text-gray-400"}`} />
                  <span className="text-sm text-gray-500">{uploading ? "Uploading…" : "Upload B-scan or surgical images"}</span>
                  <input type="file" multiple accept="image/*" onChange={uploadBScan} className="hidden" />
                </label>
                {bscanUrls.length > 0 && (
                  <div className="flex gap-2 mt-2 flex-wrap">
                    {bscanUrls.map((url, i) => (
                      <img key={i} src={url} alt={`bscan ${i+1}`} className="h-16 w-16 object-cover rounded-lg border border-gray-200" />
                    ))}
                  </div>
                )}
              </div>

              <button onClick={handleSave} disabled={saving}
                className="w-full flex items-center justify-center gap-2 brand-gradient text-white py-3.5 rounded-xl font-bold text-sm disabled:opacity-60">
                <Save className="h-4 w-4" /> {saving ? "Saving…" : "Save Surgery Record"}
              </button>
            </div>
          ) : (
            <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 flex items-center justify-center h-64">
              <div className="text-center text-gray-400">
                <Scissors className="h-10 w-10 mx-auto mb-3 opacity-30" />
                <p className="text-sm">Select a surgery to record parameters</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </StaffLayout>
  );
}
