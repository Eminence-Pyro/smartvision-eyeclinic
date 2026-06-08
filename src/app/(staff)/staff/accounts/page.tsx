"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CreditCard, Search, Receipt, DollarSign } from "lucide-react";
import StaffLayout from "@/components/staff/StaffLayout";
import { formatCurrency, formatDate } from "@/lib/utils";

const PAYMENT_TYPES = [
  { value:"consultation",    label:"Consultation Fee"    },
  { value:"express_service", label:"Express Service"     },
  { value:"medication",      label:"Medication"          },
  { value:"scan",            label:"Scan / Investigation"},
  { value:"surgery",         label:"Surgery"             },
  { value:"other",           label:"Other"               },
];

const PAYMENT_METHODS = [
  { value:"cash",         label:"Cash"         },
  { value:"pos",          label:"POS"          },
  { value:"transfer",     label:"Bank Transfer"},
  { value:"hmo",          label:"HMO"          },
  { value:"clinic_billed",label:"Clinic Billed"},
  { value:"other",        label:"Other"        },
];

export default function AccountsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [tab, setTab] = useState<"record"|"history">("record");
  const [searchQ, setSearchQ]     = useState("");
  const [visits, setVisits]       = useState<{ id: string; first_name: string; last_name: string; tally_number: string; patient_id: string; patient_number: string; status: string }[]>([]);
  const [selectedVisit, setSelected] = useState<(typeof visits)[0] | null>(null);
  const [payments, setPayments]   = useState<{ id: string; type: string; amount: number; method: string; status: string; receipt_number: string; paid_at: string; description: string }[]>([]);
  const [form, setForm]           = useState({ type:"consultation", description:"", amount:"", method:"cash", hmo_name:"", hmo_auth_code:"", notes:"" });
  const [saving, setSaving]       = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/staff/login");
    const role = (session?.user as { role?: string })?.role;
    if (status === "authenticated" && role && !["admin","accounts"].includes(role)) {
      toast.error("Access denied."); router.push("/staff/dashboard");
    }
  }, [session, status, router]);

  const searchVisits = async () => {
    const res = await fetch(`/api/visits?date=today`);
    const data = await res.json();
    const all = data.visits || [];
    if (searchQ) {
      const q = searchQ.toLowerCase();
      setVisits(all.filter((v: { first_name: string; last_name: string; tally_number: string; patient_number: string }) =>
        `${v.first_name} ${v.last_name}`.toLowerCase().includes(q) ||
        v.tally_number?.includes(q) || v.patient_number?.includes(q)
      ));
    } else setVisits(all);
  };

  useEffect(() => { searchVisits(); }, []);

  const loadPayments = async (visitId: string) => {
    const res = await fetch(`/api/payments?visit_id=${visitId}`);
    const data = await res.json();
    setPayments(data.payments || []);
  };

  const selectVisit = (v: typeof visits[0]) => {
    setSelected(v);
    loadPayments(v.id);
    // Default description by type
    if (form.type === "consultation") setForm(f => ({ ...f, description: "Consultation fee" }));
  };

  const handleRecord = async () => {
    if (!selectedVisit) { toast.error("Select a patient visit."); return; }
    if (!form.amount || parseFloat(form.amount) <= 0) { toast.error("Enter a valid amount."); return; }
    setSaving(true);
    const res = await fetch("/api/payments", {
      method:"POST", headers:{"Content-Type":"application/json"},
      body: JSON.stringify({
        visit_id:    selectedVisit.id,
        patient_id:  selectedVisit.patient_id,
        type:        form.type,
        description: form.description,
        amount:      parseFloat(form.amount),
        method:      form.method,
        hmo_name:    form.hmo_name || undefined,
        hmo_auth_code: form.hmo_auth_code || undefined,
        notes:       form.notes || undefined,
      }),
    });
    setSaving(false);
    if (res.ok) {
      const data = await res.json();
      toast.success(`Payment recorded. Receipt: ${data.receipt_number}`);
      setForm({ type:"consultation", description:"", amount:"", method:"cash", hmo_name:"", hmo_auth_code:"", notes:"" });
      loadPayments(selectedVisit.id);
    } else {
      const err = await res.json();
      toast.error(err.error || "Failed to record payment.");
    }
  };

  const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));

  const totalPaid = payments.filter(p => p.status === "paid").reduce((s, p) => s + Number(p.amount), 0);

  return (
    <StaffLayout>
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="font-bold text-2xl text-gray-900">Accounts</h1>
          <p className="text-gray-500 text-sm">Record payments — consultations, scans, medications, surgeries</p>
        </div>

        <div className="flex gap-2 mb-6">
          {[["record","Record Payment"],["history","Today's Payments"]].map(([id, label]) => (
            <button key={id} onClick={() => setTab(id as "record"|"history")}
              className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${tab === id ? "brand-gradient text-white shadow" : "bg-white text-gray-600 border border-gray-200 hover:border-brand"}`}>
              {label}
            </button>
          ))}
        </div>

        {tab === "record" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left: patient search */}
            <div className="bg-white rounded-2xl border border-gray-200 p-5 space-y-4">
              <h3 className="font-bold text-gray-900 flex items-center gap-2">
                <Search className="h-4 w-4 text-brand" /> Find Patient
              </h3>
              <div className="flex gap-2">
                <input value={searchQ} onChange={e => setSearchQ(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && searchVisits()}
                  placeholder="Tally #, name, patient number…"
                  className="flex-1 border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-brand" />
                <button onClick={searchVisits} className="brand-gradient text-white px-4 rounded-xl text-sm font-semibold">Go</button>
              </div>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {visits.map(v => (
                  <button key={v.id} onClick={() => selectVisit(v)}
                    className={`w-full text-left p-3 rounded-xl border text-sm transition-all ${selectedVisit?.id === v.id ? "border-brand bg-brand-50" : "border-gray-100 hover:border-brand-200"}`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-bold text-brand">#{v.tally_number}</span>
                        <span className="ml-2 font-semibold text-gray-900">{v.first_name} {v.last_name}</span>
                      </div>
                      <span className="text-xs text-gray-400">{v.patient_number}</span>
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">Status: {v.status?.replace(/_/g," ")}</p>
                  </button>
                ))}
              </div>

              {/* Payment history for selected patient */}
              {selectedVisit && payments.length > 0 && (
                <div className="border-t border-gray-100 pt-4">
                  <p className="text-xs font-bold text-gray-500 uppercase mb-2">Payments This Visit</p>
                  <div className="space-y-1.5">
                    {payments.map(p => (
                      <div key={p.id} className="flex items-center justify-between text-xs">
                        <span className="text-gray-700">{p.type?.replace(/_/g," ")} — {p.description}</span>
                        <span className="font-bold text-brand">{formatCurrency(Number(p.amount))}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100">
                    <span className="text-xs font-bold text-gray-700">Total Paid</span>
                    <span className="font-black text-brand">{formatCurrency(totalPaid)}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Right: payment form */}
            <div className="bg-white rounded-2xl border border-gray-200 p-5 space-y-4">
              <h3 className="font-bold text-gray-900 flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-brand" /> Record Payment
                {selectedVisit && <span className="ml-auto text-xs text-brand font-normal">For: {selectedVisit.first_name} {selectedVisit.last_name}</span>}
              </h3>

              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Payment Type</label>
                  <select value={form.type} onChange={e => set("type", e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-brand bg-white">
                    {PAYMENT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Description</label>
                  <input value={form.description} onChange={e => set("description", e.target.value)}
                    placeholder="e.g. Phaco surgery — right eye"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-brand" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Amount (₦)</label>
                  <input type="number" min="0" step="50" value={form.amount} onChange={e => set("amount", e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-brand" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Payment Method</label>
                  <select value={form.method} onChange={e => set("method", e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-brand bg-white">
                    {PAYMENT_METHODS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                  </select>
                </div>
                {form.method === "hmo" && (
                  <>
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">HMO Name</label>
                      <input value={form.hmo_name} onChange={e => set("hmo_name", e.target.value)}
                        className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-brand" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">HMO Auth Code</label>
                      <input value={form.hmo_auth_code} onChange={e => set("hmo_auth_code", e.target.value)}
                        className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-brand" />
                    </div>
                  </>
                )}
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Notes</label>
                  <input value={form.notes} onChange={e => set("notes", e.target.value)}
                    placeholder="Optional notes…"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-brand" />
                </div>
              </div>

              <button onClick={handleRecord} disabled={saving || !selectedVisit}
                className="w-full flex items-center justify-center gap-2 brand-gradient text-white py-3.5 rounded-xl font-bold text-sm disabled:opacity-60">
                <Receipt className="h-4 w-4" /> {saving ? "Recording…" : "Record Payment & Issue Receipt"}
              </button>
            </div>
          </div>
        )}

        {tab === "history" && (
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <p className="font-bold text-gray-900">Today's Payments</p>
              <TodaySummary />
            </div>
            <TodayPaymentsTable />
          </div>
        )}
      </div>
    </StaffLayout>
  );
}

function TodaySummary() {
  const [total, setTotal] = useState(0);
  useEffect(() => {
    fetch("/api/payments?date=today").then(r => r.ok ? r.json() : {}).then(d => {
      const sum = (d.payments || []).filter((p: { status: string }) => p.status === "paid").reduce((s: number, p: { amount: number }) => s + Number(p.amount), 0);
      setTotal(sum);
    });
  }, []);
  return <p className="font-black text-brand text-lg">{formatCurrency(total)}</p>;
}

function TodayPaymentsTable() {
  const [rows, setRows] = useState<{ id: string; type: string; amount: number; method: string; receipt_number: string; paid_at: string; description: string; first_name: string; last_name: string; tally_number: string }[]>([]);
  useEffect(() => {
    fetch("/api/payments?date=today").then(r => r.ok ? r.json() : {}).then(d => setRows(d.payments || []));
  }, []);
  return (
    <table className="w-full text-sm">
      <thead className="bg-gray-50">
        <tr>{["Tally","Patient","Type","Amount","Method","Receipt","Time"].map(h => (
          <th key={h} className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase">{h}</th>
        ))}</tr>
      </thead>
      <tbody className="divide-y divide-gray-50">
        {rows.map(p => (
          <tr key={p.id} className="hover:bg-gray-50">
            <td className="px-4 py-3 font-mono font-bold text-brand">#{p.tally_number}</td>
            <td className="px-4 py-3 font-medium text-gray-900">{p.first_name} {p.last_name}</td>
            <td className="px-4 py-3 capitalize text-gray-700">{p.type?.replace(/_/g," ")}</td>
            <td className="px-4 py-3 font-bold text-brand">{formatCurrency(Number(p.amount))}</td>
            <td className="px-4 py-3 capitalize text-gray-600">{p.method}</td>
            <td className="px-4 py-3 font-mono text-xs text-gray-500">{p.receipt_number}</td>
            <td className="px-4 py-3 text-gray-400 text-xs">{formatDate(p.paid_at, "HH:mm")}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
