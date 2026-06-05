"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Pill, ArrowLeft, CheckCircle2, Clock } from "lucide-react";
import { formatDate } from "@/lib/utils";

export default function MedicationsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [prescriptions, setRx] = useState<{
    id: string; drug_name: string; dosage: string; frequency: string;
    duration: string; route: string; eye_side: string; instructions: string;
    dispensed: boolean; created_at: string; visit_date: string;
  }[]>([]);

  useEffect(() => { if (status === "unauthenticated") router.push("/portal/login"); }, [status, router]);
  useEffect(() => {
    fetch("/api/portal/prescriptions").then(r => r.json()).then(d => setRx(d.prescriptions || []));
  }, []);

  const active   = prescriptions.filter(p => !p.dispensed);
  const dispensed = prescriptions.filter(p => p.dispensed);

  const RxCard = ({ rx }: { rx: typeof prescriptions[0] }) => (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 flex items-start gap-4">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${rx.dispensed ? "bg-green-100" : "bg-purple-100"}`}>
        <Pill className={`h-5 w-5 ${rx.dispensed ? "text-green-600" : "text-purple-600"}`} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 mb-1">
          <p className="font-bold text-gray-900">{rx.drug_name}</p>
          <span className={`flex-shrink-0 flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${rx.dispensed ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
            {rx.dispensed ? <><CheckCircle2 className="h-3 w-3" /> Dispensed</> : <><Clock className="h-3 w-3" /> Pending</>}
          </span>
        </div>
        <div className="flex flex-wrap gap-2 mb-2">
          {rx.dosage    && <span className="text-xs bg-gray-100 px-2 py-0.5 rounded-full text-gray-600">{rx.dosage}</span>}
          {rx.frequency && <span className="text-xs bg-gray-100 px-2 py-0.5 rounded-full text-gray-600">{rx.frequency}</span>}
          {rx.duration  && <span className="text-xs bg-gray-100 px-2 py-0.5 rounded-full text-gray-600">{rx.duration}</span>}
          {rx.route     && <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full capitalize">{rx.route}</span>}
          {rx.eye_side  && <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full capitalize">{rx.eye_side} eye</span>}
        </div>
        {rx.instructions && <p className="text-xs text-gray-500 italic">{rx.instructions}</p>}
        <p className="text-xs text-gray-400 mt-1.5">Prescribed: {formatDate(rx.visit_date || rx.created_at)}</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-6 h-16 flex items-center gap-4">
          <Link href="/portal/dashboard" className="text-gray-400 hover:text-brand"><ArrowLeft className="h-5 w-5" /></Link>
          <h1 className="font-bold text-gray-900">My Medications</h1>
        </div>
      </header>
      <main className="max-w-3xl mx-auto px-6 py-8 space-y-8">
        <div>
          <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-2">
            <Clock className="h-4 w-4 text-yellow-500" /> Active / Pending ({active.length})
          </h2>
          {active.length === 0 ? <p className="text-gray-400 text-sm">No pending medications.</p> : (
            <div className="space-y-3">{active.map(rx => <RxCard key={rx.id} rx={rx} />)}</div>
          )}
        </div>
        {dispensed.length > 0 && (
          <div>
            <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500" /> Dispensed ({dispensed.length})
            </h2>
            <div className="space-y-3">{dispensed.map(rx => <RxCard key={rx.id} rx={rx} />)}</div>
          </div>
        )}
      </main>
    </div>
  );
}
