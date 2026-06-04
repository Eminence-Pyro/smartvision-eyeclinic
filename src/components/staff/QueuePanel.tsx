"use client";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Clock, CheckCircle2, SkipForward, RefreshCw } from "lucide-react";
import { formatDate, VISIT_STATUS_LABELS, VISIT_STATUS_COLORS } from "@/lib/utils";
import type { QueueEntry } from "@/lib/types";

export default function QueuePanel({ department }: { department: string }) {
  const [queue, setQueue]   = useState<QueueEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const res = await fetch(`/api/queue?department=${department}&date=today`);
    const data = await res.json();
    setQueue(data.queue || []);
    setLoading(false);
  };

  useEffect(() => { load(); const t = setInterval(load, 30000); return () => clearInterval(t); }, []);

  const updateStatus = async (id: string, status: string) => {
    await fetch(`/api/queue/${id}`, { method:"PATCH", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ status }) });
    toast.success(`Queue entry ${status}`);
    load();
  };

  const waiting  = queue.filter(q => q.status === "waiting");
  const called   = queue.filter(q => q.status === "called" || q.status === "in_progress");
  const done     = queue.filter(q => q.status === "done");

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex gap-3 text-sm">
          <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full font-semibold">{waiting.length} waiting</span>
          <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full font-semibold">{called.length} in progress</span>
          <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full font-semibold">{done.length} done</span>
        </div>
        <button onClick={load} disabled={loading} className="flex items-center gap-1.5 text-brand text-sm font-medium">
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} /> Refresh
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {["#","Patient","Status","Arrived","Actions"].map(h => (
                <th key={h} className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {queue.length === 0 && (
              <tr><td colSpan={5} className="text-center py-10 text-gray-400">Queue is empty today.</td></tr>
            )}
            {queue.map(entry => (
              <tr key={entry.id} className={`hover:bg-gray-50 ${entry.status === "called" ? "bg-green-50" : ""}`}>
                <td className="px-4 py-3 font-mono font-bold text-brand">{String(entry.tally_number).padStart(3,"0")}</td>
                <td className="px-4 py-3">
                  <p className="font-semibold text-gray-900">{entry.patient?.first_name} {entry.patient?.last_name}</p>
                  <p className="text-gray-400 text-xs">{entry.patient?.patient_number}</p>
                </td>
                <td className="px-4 py-3">
                  <span className={`status-badge ${VISIT_STATUS_COLORS[entry.visit?.status || ""] || "bg-gray-100 text-gray-600"}`}>
                    {VISIT_STATUS_LABELS[entry.visit?.status || ""] || entry.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-500 text-xs">{formatDate(entry.created_at, "HH:mm")}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    {entry.status === "waiting" && (
                      <button onClick={() => updateStatus(entry.id, "called")}
                        className="text-xs brand-gradient text-white px-3 py-1.5 rounded-lg font-semibold">
                        Call
                      </button>
                    )}
                    {entry.status === "called" && (
                      <button onClick={() => updateStatus(entry.id, "done")}
                        className="flex items-center gap-1 text-xs bg-green-600 text-white px-3 py-1.5 rounded-lg font-semibold">
                        <CheckCircle2 className="h-3 w-3" /> Done
                      </button>
                    )}
                    {entry.status === "waiting" && (
                      <button onClick={() => updateStatus(entry.id, "skipped")}
                        className="flex items-center gap-1 text-xs border border-gray-200 text-gray-600 px-3 py-1.5 rounded-lg">
                        <SkipForward className="h-3 w-3" /> Skip
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
