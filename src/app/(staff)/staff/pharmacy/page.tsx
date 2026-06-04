"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Pill, CheckCircle2, Search } from "lucide-react";
import StaffLayout from "@/components/staff/StaffLayout";
import { formatDate } from "@/lib/utils";

export default function PharmacyPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [prescriptions, setPrescriptions] = useState<{ id: string; drug_name: string; dosage: string; frequency: string; duration: string; route: string; eye_side: string; instructions: string; quantity: number; dispensed: boolean; first_name: string; last_name: string; patient_number: string; tally_number: string; visit_id: string; prescribed_by_name: string; created_at: string }[]>([]);
  const [search, setSearch] = useState("");
  const [dispensing, setDispensing] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/staff/login");
    const role = (session?.user as { role?: string })?.role;
    if (status === "authenticated" && role && !["admin","pharmacy"].includes(role)) {
      toast.error("Access denied."); router.push("/staff/dashboard");
    }
  }, [session, status, router]);

  const load = () => {
    fetch("/api/prescriptions?date=today&dispensed=false")
      .then(r => r.json()).then(d => setPrescriptions(d.prescriptions || []));
  };

  useEffect(() => { load(); }, []);

  const dispense = async (id: string) => {
    setDispensing(id);
    const res = await fetch(`/api/prescriptions/${id}/dispense`, {
      method:"PATCH", headers:{"Content-Type":"application/json"},
      body: JSON.stringify({ dispensed: true })
    });
    setDispensing(null);
    if (res.ok) { toast.success("Medication dispensed."); load(); }
    else toast.error("Failed to mark as dispensed.");
  };

  const filtered = prescriptions.filter(p => {
    const q = search.toLowerCase();
    return `${p.first_name} ${p.last_name}`.toLowerCase().includes(q) ||
           p.tally_number?.includes(q) || p.drug_name?.toLowerCase().includes(q);
  });

  // Group by patient
  const byPatient: Record<string, typeof filtered> = {};
  filtered.forEach(p => {
    const key = `${p.first_name} ${p.last_name}||${p.tally_number}`;
    if (!byPatient[key]) byPatient[key] = [];
    byPatient[key].push(p);
  });

  return (
    <StaffLayout>
      <div className="max-w-5xl mx-auto">
        <div className="mb-6">
          <h1 className="font-bold text-2xl text-gray-900">Pharmacy</h1>
          <p className="text-gray-500 text-sm">Dispense medications — today&apos;s active prescriptions</p>
        </div>

        <div className="flex gap-3 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search by patient name, tally #, or drug…"
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-brand" />
          </div>
          <button onClick={load} className="border border-gray-200 px-4 rounded-xl text-sm text-gray-600 hover:border-brand">Refresh</button>
        </div>

        {Object.keys(byPatient).length === 0 && (
          <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
            <Pill className="h-10 w-10 mx-auto mb-3 text-gray-300" />
            <p className="text-gray-400">No pending prescriptions today.</p>
          </div>
        )}

        <div className="space-y-5">
          {Object.entries(byPatient).map(([key, rxs]) => {
            const [nameKey, tally] = key.split("||");
            return (
              <div key={key} className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                <div className="bg-brand-50 border-b border-brand-100 px-5 py-3 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-brand mr-3">#{tally}</span>
                    <span className="font-semibold text-gray-900">{nameKey}</span>
                    <span className="ml-2 text-gray-500 text-xs">{rxs[0]?.patient_number}</span>
                  </div>
                  <span className="text-xs text-gray-500">{rxs.length} item{rxs.length > 1 ? "s" : ""}</span>
                </div>
                <div className="divide-y divide-gray-50">
                  {rxs.map(rx => (
                    <div key={rx.id} className={`flex items-start gap-4 p-4 ${rx.dispensed ? "opacity-50" : ""}`}>
                      <div className="w-9 h-9 rounded-xl bg-brand-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Pill className="h-4 w-4 text-brand" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 text-sm">{rx.drug_name}</p>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {rx.dosage   && <span className="text-xs bg-gray-100 px-2 py-0.5 rounded-full text-gray-600">{rx.dosage}</span>}
                          {rx.frequency && <span className="text-xs bg-gray-100 px-2 py-0.5 rounded-full text-gray-600">{rx.frequency}</span>}
                          {rx.duration  && <span className="text-xs bg-gray-100 px-2 py-0.5 rounded-full text-gray-600">{rx.duration}</span>}
                          {rx.route     && <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">{rx.route}</span>}
                          {rx.eye_side  && <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full capitalize">{rx.eye_side} eye</span>}
                          {rx.quantity  && <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">Qty: {rx.quantity}</span>}
                        </div>
                        {rx.instructions && <p className="text-xs text-gray-500 mt-1 italic">{rx.instructions}</p>}
                      </div>
                      <div className="flex-shrink-0">
                        {rx.dispensed ? (
                          <span className="flex items-center gap-1 text-xs text-green-600 font-semibold">
                            <CheckCircle2 className="h-4 w-4" /> Dispensed
                          </span>
                        ) : (
                          <button onClick={() => dispense(rx.id)} disabled={dispensing === rx.id}
                            className="flex items-center gap-1.5 brand-gradient text-white px-4 py-2 rounded-xl text-xs font-bold disabled:opacity-60">
                            {dispensing === rx.id ? "…" : <><CheckCircle2 className="h-3.5 w-3.5" /> Dispense</>}
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </StaffLayout>
  );
}
