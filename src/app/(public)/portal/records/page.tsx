"use client";
import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FileText, ArrowLeft, Eye, Activity, Stethoscope, Pill, Camera } from "lucide-react";
import { formatDate, VISIT_STATUS_LABELS, VISIT_STATUS_COLORS } from "@/lib/utils";
import { useLazyLoad } from "@/lib/useLazyLoad";

interface Visit {
  id: string;
  visit_date: string;
  status: string;
  chief_complaint: string;
  tally_number: string;
  visit_type: string;
}

interface VisitDetail {
  vitals?: Record<string, unknown>;
  va?: Record<string, unknown>;
  notes?: Record<string, unknown>;
  prescriptions?: Record<string, unknown>[];
  scans?: Record<string, unknown>[];
}

const VISITS_PER_PAGE = 10;

export default function RecordsPage() {
  const { status } = useSession();
  const router = useRouter();
  const [visits, setVisits]         = useState<Visit[]>([]);
  const [selected, setSelected]     = useState<Visit | null>(null);
  const [detail, setDetail]         = useState<VisitDetail | null>(null);
  const [loading, setLoading]       = useState(false);
  const [allLoaded, setAllLoaded]   = useState(false);
  const [page, setPage]             = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/portal/login");
  }, [status, router]);

  // Initial load
  useEffect(() => {
    loadVisits(1);
  }, []);

  const loadVisits = async (pageNum: number) => {
    if (pageNum === 1) setLoading(true);
    else setLoadingMore(true);
    
    try {
      const res = await fetch(`/api/portal/visits?limit=${VISITS_PER_PAGE}&offset=${(pageNum - 1) * VISITS_PER_PAGE}`);
      const d = await res.json();
      const newVisits = d.visits || [];
      
      if (pageNum === 1) {
        setVisits(newVisits);
      } else {
        setVisits(prev => [...prev, ...newVisits]);
      }
      
      if (newVisits.length < VISITS_PER_PAGE) {
        setAllLoaded(true);
      }
      setPage(pageNum);
    } finally {
      if (pageNum === 1) setLoading(false);
      else setLoadingMore(false);
    }
  };

  const loadMoreTrigger = useCallback(() => {
    if (!allLoaded && !loadingMore && !loading && page > 0) {
      loadVisits(page + 1);
    }
  }, [page, allLoaded, loadingMore, loading]);

  const loadMoreRef = useLazyLoad({
    threshold: 0.1,
    rootMargin: "200px",
    onVisible: loadMoreTrigger,
  });

  const openVisit = async (v: Visit) => {
    setSelected(v);
    setLoading(true);
    const [vit, va, notes, rx, scans] = await Promise.all([
      fetch(`/api/vitals?visit_id=${v.id}`).then(r => r.json()),
      fetch(`/api/vision-assessment?visit_id=${v.id}`).then(r => r.json()),
      fetch(`/api/clinical-notes?visit_id=${v.id}`).then(r => r.json()),
      fetch(`/api/prescriptions?visit_id=${v.id}`).then(r => r.json()),
      fetch(`/api/scans?visit_id=${v.id}`).then(r => r.json()),
    ]);
    setDetail({
      vitals: vit.vitals || null,
      va: va.assessment || null,
      notes: notes.notes || null,
      prescriptions: rx.prescriptions || [],
      scans: scans.scans || [],
    });
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center gap-4">
          <Link href="/portal/dashboard" className="text-gray-400 hover:text-brand"><ArrowLeft className="h-5 w-5" /></Link>
          <h1 className="font-bold text-gray-900">Medical Records</h1>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Visit list */}
          <div className="space-y-3">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Your Visits</p>
            {visits.length === 0 && <p className="text-gray-400 text-sm">No visits recorded yet.</p>}
            {visits.map(v => (
              <button key={v.id} onClick={() => openVisit(v)}
                className={`w-full text-left p-4 rounded-xl border transition-all ${selected?.id === v.id ? "border-brand bg-brand-50" : "bg-white border-gray-100 hover:border-brand-200"}`}>
                <div className="flex items-center justify-between mb-1">
                  <p className="font-semibold text-gray-900 text-sm">{formatDate(v.visit_date)}</p>
                  <span className={`status-badge text-xs ${VISIT_STATUS_COLORS[v.status] || "bg-gray-100 text-gray-500"}`}>
                    {VISIT_STATUS_LABELS[v.status] || v.status}
                  </span>
                </div>
                <p className="text-gray-500 text-xs truncate">{v.chief_complaint || "General consultation"}</p>
              </button>
            ))}
          </div>

          {/* Visit detail */}
          <div className="md:col-span-2 space-y-5">
            {!selected && (
              <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
                <FileText className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p className="text-gray-400">Select a visit to view details</p>
              </div>
            )}

            {selected && loading && (
              <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand mx-auto" />
              </div>
            )}

            {selected && !loading && detail && (
              <>
                {/* Vitals */}
                {detail.vitals && (
                  <div className="bg-white rounded-2xl border border-gray-200 p-5">
                    <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2 text-sm">
                      <Activity className="h-4 w-4 text-brand" /> Vitals
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                      {[
                        ["Blood Pressure",  `${detail.vitals.bp_systolic||"—"}/${detail.vitals.bp_diastolic||"—"} mmHg`],
                        ["Pulse",          `${detail.vitals.pulse_bpm||"—"} bpm`],
                        ["Weight",         `${detail.vitals.weight_kg||"—"} kg`],
                        ["Height",         `${detail.vitals.height_cm||"—"} cm`],
                        ["BMI",            `${detail.vitals.bmi||"—"}`],
                        ["Temperature",    `${detail.vitals.temperature_c||"—"}°C`],
                        ["SpO₂",          `${detail.vitals.spo2_percent||"—"}%`],
                        ["Blood Sugar",    `${detail.vitals.blood_sugar||"—"}`],
                      ].map(([label, value]) => (
                        <div key={label as string} className="bg-gray-50 rounded-xl p-3">
                          <p className="text-xs text-gray-500 font-semibold">{label}</p>
                          <p className="font-bold text-gray-900 mt-0.5">{value as string}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Vision Assessment */}
                {detail.va && (
                  <div className="bg-white rounded-2xl border border-gray-200 p-5">
                    <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2 text-sm">
                      <Eye className="h-4 w-4 text-brand" /> Vision Assessment
                    </h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="bg-red-50 rounded-xl p-4">
                        <p className="text-xs font-bold text-red-600 mb-2">RIGHT EYE</p>
                        <p className="text-xs text-gray-500">Unaided: <b>{String(detail.va.va_right_unaided||"—")}</b></p>
                        <p className="text-xs text-gray-500">Aided: <b>{String(detail.va.va_right_aided||"—")}</b></p>
                        <p className="text-xs text-gray-500">Pinhole: <b>{String(detail.va.va_right_ph||"—")}</b></p>
                        <p className="text-xs text-gray-500">IOP: <b>{String(detail.va.iop_right||"—")} mmHg</b></p>
                      </div>
                      <div className="bg-blue-50 rounded-xl p-4">
                        <p className="text-xs font-bold text-blue-600 mb-2">LEFT EYE</p>
                        <p className="text-xs text-gray-500">Unaided: <b>{String(detail.va.va_left_unaided||"—")}</b></p>
                        <p className="text-xs text-gray-500">Aided: <b>{String(detail.va.va_left_aided||"—")}</b></p>
                        <p className="text-xs text-gray-500">Pinhole: <b>{String(detail.va.va_left_ph||"—")}</b></p>
                        <p className="text-xs text-gray-500">IOP: <b>{String(detail.va.iop_left||"—")} mmHg</b></p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Doctor notes */}
                {detail.notes && (
                  <div className="bg-white rounded-2xl border border-gray-200 p-5">
                    <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2 text-sm">
                      <Stethoscope className="h-4 w-4 text-brand" /> Doctor&apos;s Notes
                    </h3>
                    <div className="space-y-3 text-sm">
                      {detail.notes.diagnosis_right && <p><span className="font-semibold">Right Eye:</span> {String(detail.notes.diagnosis_right)}</p>}
                      {detail.notes.diagnosis_left  && <p><span className="font-semibold">Left Eye:</span> {String(detail.notes.diagnosis_left)}</p>}
                      {detail.notes.management_plan && (
                        <div className="bg-brand-50 rounded-xl p-3">
                          <p className="text-xs font-bold text-brand mb-1">Management Plan</p>
                          <p className="text-gray-700">{String(detail.notes.management_plan)}</p>
                        </div>
                      )}
                      {detail.notes.follow_up_date && <p className="text-xs text-gray-500">Follow-up: <b>{formatDate(String(detail.notes.follow_up_date))}</b></p>}
                    </div>
                  </div>
                )}

                {/* Prescriptions */}
                {detail.prescriptions && detail.prescriptions.length > 0 && (
                  <div className="bg-white rounded-2xl border border-gray-200 p-5">
                    <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2 text-sm">
                      <Pill className="h-4 w-4 text-brand" /> Prescriptions
                    </h3>
                    <div className="space-y-2">
                      {detail.prescriptions.map((rx, i) => (
                        <div key={i} className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                          <Pill className="h-4 w-4 text-purple-500 flex-shrink-0 mt-0.5" />
                          <div className="text-sm">
                            <p className="font-semibold text-gray-900">{String(rx.drug_name)}</p>
                            <p className="text-gray-500 text-xs">{String(rx.dosage||"")} · {String(rx.frequency||"")} · {String(rx.duration||"")}</p>
                          </div>
                          <span className={`ml-auto text-xs px-2 py-0.5 rounded-full font-semibold ${rx.dispensed ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                            {rx.dispensed ? "Dispensed" : "Pending"}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Scans */}
                {detail.scans && detail.scans.length > 0 && (
                  <div className="bg-white rounded-2xl border border-gray-200 p-5">
                    <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2 text-sm">
                      <Camera className="h-4 w-4 text-brand" /> Investigations
                    </h3>
                    <div className="space-y-3">
                      {detail.scans.map((s, i) => (
                        <div key={i} className="p-4 border border-gray-100 rounded-xl">
                          <p className="font-semibold text-sm text-gray-900 mb-1">{String(s.type||"").replace(/_/g," ")} — {String(s.eye_side||"")}</p>
                          {s.findings && <p className="text-gray-600 text-xs leading-relaxed">{String(s.findings)}</p>}
                          {Array.isArray(s.image_urls) && s.image_urls.length > 0 && (
                            <div className="flex gap-2 mt-2 flex-wrap">
                              {(s.image_urls as string[]).map((url, j) => (
                                <a key={j} href={url} target="_blank" rel="noopener noreferrer">
                                  <img src={url} className="h-16 w-16 object-cover rounded-lg border border-gray-200" alt="scan" />
                                </a>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
