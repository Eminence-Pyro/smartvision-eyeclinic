"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Camera, Upload, Search, Save } from "lucide-react";
import StaffLayout from "@/components/staff/StaffLayout";
import { SCAN_TYPE_LABELS } from "@/lib/utils";

export default function ScanRoomPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [scans, setScans]       = useState<{ id: string; type: string; eye_side: string; indication: string; visit_id: string; first_name: string; last_name: string; patient_number: string; tally_number: string }[]>([]);
  const [selected, setSelected] = useState<typeof scans[0] | null>(null);
  const [findings, setFindings] = useState("");
  const [images, setImages]     = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving]     = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/staff/login");
    const role = (session?.user as { role?: string })?.role;
    if (status === "authenticated" && role && !["admin","scan_room"].includes(role)) {
      toast.error("Access denied."); router.push("/staff/dashboard");
    }
  }, [session, status, router]);

  useEffect(() => {
    fetch("/api/scans?status=booked&date=today")
      .then(r => r.json()).then(d => setScans(d.scans || []));
  }, []);

  const uploadToCloudinary = async (file: File): Promise<string> => {
    const fd = new FormData();
    fd.append("file", file);
    fd.append("upload_preset", "smartvision_scans");
    fd.append("folder", "smartvision/scans");
    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
      { method:"POST", body: fd }
    );
    const data = await res.json();
    return data.secure_url;
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setUploading(true);
    try {
      const urls = await Promise.all(files.map(uploadToCloudinary));
      setImages(prev => [...prev, ...urls]);
      toast.success(`${files.length} image(s) uploaded.`);
    } catch {
      toast.error("Upload failed. Check Cloudinary preset.");
    }
    setUploading(false);
  };

  const handleSave = async () => {
    if (!selected) { toast.error("Select a scan first."); return; }
    setSaving(true);
    const res = await fetch(`/api/scans/${selected.id}`, {
      method:"PATCH", headers:{"Content-Type":"application/json"},
      body: JSON.stringify({ findings, image_urls: images, status:"done" })
    });
    setSaving(false);
    if (res.ok) {
      toast.success("Scan results saved. Patient sent back to doctor.");
      setSelected(null); setFindings(""); setImages([]);
      fetch("/api/scans?status=booked&date=today").then(r => r.json()).then(d => setScans(d.scans || []));
    } else toast.error("Failed to save scan results.");
  };

  return (
    <StaffLayout>
      <div className="max-w-5xl mx-auto">
        <div className="mb-6">
          <h1 className="font-bold text-2xl text-gray-900">Scan / OCT Room</h1>
          <p className="text-gray-500 text-sm">Upload investigation results and findings</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Booked scans list */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Search className="h-4 w-4 text-brand" /> Booked Scans Today
            </h3>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {scans.length === 0 && <p className="text-gray-400 text-sm text-center py-6">No scans booked today.</p>}
              {scans.map(s => (
                <button key={s.id} onClick={() => { setSelected(s); setFindings(""); setImages([]); }}
                  className={`w-full text-left p-4 rounded-xl border transition-all ${selected?.id === s.id ? "border-brand bg-brand-50" : "border-gray-100 hover:border-brand-200"}`}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-gray-900 text-sm">{s.first_name} {s.last_name}</span>
                    <span className="text-xs text-brand font-bold">#{s.tally_number}</span>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-medium">
                      {SCAN_TYPE_LABELS[s.type] || s.type}
                    </span>
                    <span className="text-xs text-gray-500 capitalize">{s.eye_side} eye</span>
                  </div>
                  {s.indication && <p className="text-xs text-gray-400 mt-1 truncate">{s.indication}</p>}
                </button>
              ))}
            </div>
          </div>

          {/* Upload form */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5 space-y-4">
            <h3 className="font-bold text-gray-900 flex items-center gap-2">
              <Camera className="h-4 w-4 text-brand" />
              {selected ? `${SCAN_TYPE_LABELS[selected.type] || selected.type} — ${selected.first_name} ${selected.last_name}` : "Select a scan"}
            </h3>

            {!selected && (
              <div className="text-center py-12 text-gray-400">
                <Camera className="h-10 w-10 mx-auto mb-3 opacity-30" />
                <p className="text-sm">Select a booked scan to upload results</p>
              </div>
            )}

            {selected && (
              <>
                {/* Findings */}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Findings</label>
                  <textarea value={findings} onChange={e => setFindings(e.target.value)}
                    rows={5} placeholder="Document scan findings here…"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-brand resize-none" />
                </div>

                {/* Image upload */}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Upload Images</label>
                  <label className={`flex flex-col items-center gap-2 border-2 border-dashed rounded-xl p-6 cursor-pointer transition-colors ${uploading ? "border-brand bg-brand-50" : "border-gray-200 hover:border-brand"}`}>
                    <Upload className={`h-8 w-8 ${uploading ? "text-brand animate-bounce" : "text-gray-400"}`} />
                    <p className="text-sm text-gray-500">{uploading ? "Uploading…" : "Click to upload scan images"}</p>
                    <p className="text-xs text-gray-400">PNG, JPG, TIFF — multiple files supported</p>
                    <input type="file" multiple accept="image/*,.pdf" onChange={handleFileChange} className="hidden" />
                  </label>
                  {images.length > 0 && (
                    <div className="grid grid-cols-3 gap-2 mt-3">
                      {images.map((url, i) => (
                        <div key={i} className="relative">
                          <img src={url} alt={`scan ${i+1}`} className="w-full h-20 object-cover rounded-lg border border-gray-200" />
                          <button onClick={() => setImages(imgs => imgs.filter((_, j) => j !== i))}
                            className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center">✕</button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <button onClick={handleSave} disabled={saving}
                  className="w-full flex items-center justify-center gap-2 brand-gradient text-white py-3.5 rounded-xl font-bold text-sm disabled:opacity-60">
                  <Save className="h-4 w-4" /> {saving ? "Saving…" : "Save Results & Send Patient Back to Doctor"}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </StaffLayout>
  );
}
