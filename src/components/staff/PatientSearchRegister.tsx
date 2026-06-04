"use client";
import { useState } from "react";
import { Search, UserPlus, User, Star } from "lucide-react";
import { toast } from "sonner";
import type { Patient } from "@/lib/types";

interface Props {
  onVisitCreated: (visitId: string) => void;
}

export default function PatientSearchRegister({ onVisitCreated }: Props) {
  const [searchQ, setSearchQ]         = useState("");
  const [results, setResults]         = useState<Patient[]>([]);
  const [searching, setSearching]     = useState(false);
  const [selectedPatient, setSelected]= useState<Patient | null>(null);
  const [showNewForm, setShowNew]     = useState(false);
  const [isExpress, setExpress]       = useState(false);
  const [complaint, setComplaint]     = useState("");
  const [creating, setCreating]       = useState(false);

  // New patient form state
  const [newPatient, setNewPatient]   = useState({
    first_name:"", last_name:"", middle_name:"", date_of_birth:"",
    gender:"", phone:"", email:"", address:"", state_of_origin:"",
    occupation:"", next_of_kin:"", next_of_kin_phone:"",
    blood_group:"", genotype:"", allergies:"", hmo_name:"", hmo_number:""
  });

  const handleSearch = async () => {
    if (!searchQ.trim()) return;
    setSearching(true);
    const res = await fetch(`/api/patients/search?q=${encodeURIComponent(searchQ)}`);
    const data = await res.json();
    setResults(data.patients || []);
    setSearching(false);
  };

  const handleCreateVisit = async (patient: Patient) => {
    setCreating(true);
    const res = await fetch("/api/visits", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        patient_id: patient.id,
        chief_complaint: complaint,
        is_express: isExpress,
      }),
    });
    setCreating(false);
    if (res.ok) {
      const data = await res.json();
      toast.success(`Visit #${data.tally_number} created for ${patient.first_name} ${patient.last_name}`);
      onVisitCreated(data.visit_id);
    } else {
      toast.error("Failed to create visit.");
    }
  };

  const handleRegisterAndVisit = async () => {
    if (!newPatient.first_name || !newPatient.last_name) {
      toast.error("First and last name are required."); return;
    }
    setCreating(true);
    const res = await fetch("/api/patients/staff-register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...newPatient, chief_complaint: complaint, is_express: isExpress }),
    });
    setCreating(false);
    if (res.ok) {
      const data = await res.json();
      toast.success(`Patient ${data.patient_number} registered. Visit #${data.tally_number} created.`);
      onVisitCreated(data.visit_id);
    } else {
      const err = await res.json();
      toast.error(err.error || "Registration failed.");
    }
  };

  const NP = newPatient;
  const setNP = (k: string, v: string) => setNewPatient(p => ({ ...p, [k]: v }));

  return (
    <div className="space-y-6">
      {/* Search existing patient */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Search className="h-5 w-5 text-brand" /> Search Existing Patient
        </h2>
        <div className="flex gap-3">
          <input value={searchQ} onChange={e => setSearchQ(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleSearch()}
            placeholder="Name, phone, email, or patient number…"
            className="flex-1 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand" />
          <button onClick={handleSearch} disabled={searching}
            className="brand-gradient text-white px-6 rounded-xl text-sm font-semibold disabled:opacity-60">
            {searching ? "…" : "Search"}
          </button>
          <button onClick={() => setShowNew(true)}
            className="border-2 border-brand text-brand px-5 rounded-xl text-sm font-semibold hover:bg-brand-50 flex items-center gap-2">
            <UserPlus className="h-4 w-4" /> New Patient
          </button>
        </div>

        {/* Search results */}
        {results.length > 0 && (
          <div className="mt-4 space-y-2">
            {results.map(p => (
              <div key={p.id}
                className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all ${
                  selectedPatient?.id === p.id ? "border-brand bg-brand-50" : "border-gray-100 hover:border-brand-200"
                }`}
                onClick={() => setSelected(p)}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 brand-gradient rounded-full flex items-center justify-center text-white font-bold text-sm">
                    {p.first_name[0]}{p.last_name[0]}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{p.first_name} {p.middle_name} {p.last_name}</p>
                    <p className="text-gray-500 text-xs">{p.patient_number} · {p.phone} · {p.gender}</p>
                  </div>
                </div>
                {selectedPatient?.id === p.id && (
                  <span className="text-brand text-xs font-bold">Selected ✓</span>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Visit options for selected patient */}
        {selectedPatient && (
          <div className="mt-4 p-4 bg-brand-50 rounded-xl border border-brand-200">
            <p className="font-semibold text-brand-700 text-sm mb-3">
              Creating visit for: {selectedPatient.first_name} {selectedPatient.last_name}
            </p>
            <textarea value={complaint} onChange={e => setComplaint(e.target.value)}
              placeholder="Chief complaint (optional)…"
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm mb-3 focus:outline-none focus:border-brand resize-none"
              rows={2} />
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" checked={isExpress} onChange={e => setExpress(e.target.checked)}
                  className="w-4 h-4 accent-brand" />
                <Star className="h-4 w-4 text-yellow-500" /> Express Service (+fee)
              </label>
              <button onClick={() => handleCreateVisit(selectedPatient)} disabled={creating}
                className="brand-gradient text-white px-6 py-2.5 rounded-xl text-sm font-bold disabled:opacity-60">
                {creating ? "Creating…" : "Create Visit & Add to Queue"}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* New patient form */}
      {showNew && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h2 className="font-bold text-gray-900 mb-5 flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-brand" /> Register New Patient
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { key:"first_name", label:"First Name *", type:"text" },
              { key:"last_name",  label:"Last Name *",  type:"text" },
              { key:"middle_name",label:"Middle Name",  type:"text" },
              { key:"date_of_birth",label:"Date of Birth", type:"date" },
              { key:"phone",      label:"Phone",        type:"tel"  },
              { key:"email",      label:"Email",        type:"email"},
              { key:"occupation", label:"Occupation",   type:"text" },
              { key:"next_of_kin",label:"Next of Kin",  type:"text" },
              { key:"next_of_kin_phone",label:"NOK Phone", type:"tel" },
              { key:"hmo_name",   label:"HMO Name",     type:"text" },
              { key:"hmo_number", label:"HMO Number",   type:"text" },
            ].map(f => (
              <div key={f.key}>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">{f.label}</label>
                <input type={f.type} value={NP[f.key as keyof typeof NP]} onChange={e => setNP(f.key, e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-brand" />
              </div>
            ))}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Gender</label>
              <select value={NP.gender} onChange={e => setNP("gender", e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-brand">
                <option value="">Select…</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Blood Group</label>
              <select value={NP.blood_group} onChange={e => setNP("blood_group", e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-brand">
                <option value="">Select…</option>
                {["A+","A-","B+","B-","AB+","AB-","O+","O-"].map(g => <option key={g}>{g}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Genotype</label>
              <select value={NP.genotype} onChange={e => setNP("genotype", e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-brand">
                <option value="">Select…</option>
                {["AA","AS","SS","AC","SC"].map(g => <option key={g}>{g}</option>)}
              </select>
            </div>
          </div>
          <div className="mt-4">
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Address</label>
            <input value={NP.address} onChange={e => setNP("address", e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-brand" />
          </div>
          <div className="mt-3">
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Known Allergies</label>
            <input value={NP.allergies} onChange={e => setNP("allergies", e.target.value)}
              placeholder="e.g. Penicillin, NSAIDs…"
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-brand" />
          </div>
          <div className="mt-4">
            <textarea value={complaint} onChange={e => setComplaint(e.target.value)}
              placeholder="Chief complaint…"
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-brand resize-none"
              rows={2} />
          </div>
          <div className="flex items-center justify-between mt-4">
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" checked={isExpress} onChange={e => setExpress(e.target.checked)} className="accent-brand" />
              <Star className="h-4 w-4 text-yellow-500" /> Express Service
            </label>
            <div className="flex gap-3">
              <button onClick={() => setShowNew(false)} className="px-5 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600">
                Cancel
              </button>
              <button onClick={handleRegisterAndVisit} disabled={creating}
                className="brand-gradient text-white px-7 py-2.5 rounded-xl text-sm font-bold disabled:opacity-60">
                {creating ? "Saving…" : "Register & Create Visit"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
