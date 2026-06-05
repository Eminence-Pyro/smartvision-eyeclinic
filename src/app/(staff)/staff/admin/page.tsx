"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Users, UserPlus, Shield, Eye, EyeOff, CheckCircle2, XCircle, Edit } from "lucide-react";
import StaffLayout from "@/components/staff/StaffLayout";
import type { Staff } from "@/lib/types";

const ROLES = ["front_desk","va_room","accounts","doctor","scan_room","theatre","pharmacy","admin"];
const ROLE_LABELS: Record<string,string> = {
  front_desk:"Front Desk", va_room:"VA Room", accounts:"Accounts",
  doctor:"Doctor", scan_room:"Scan Room", theatre:"Theatre",
  pharmacy:"Pharmacy", admin:"Administrator"
};

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router  = useRouter();
  const [staff, setStaff]     = useState<Staff[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving]   = useState(false);
  const [form, setForm]       = useState({
    first_name:"", last_name:"", email:"", phone:"",
    role:"front_desk", department:"", password:""
  });
  const [showPass, setShowPass] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/staff/login");
    const role = (session?.user as { role?: string })?.role;
    if (status === "authenticated" && role !== "admin") {
      toast.error("Admin access only."); router.push("/staff/dashboard");
    }
  }, [session, status, router]);

  const load = () => {
    fetch("/api/staff").then(r => r.json()).then(d => setStaff(d.staff || []));
  };
  useEffect(() => { load(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.password || form.password.length < 8) { toast.error("Password must be at least 8 characters."); return; }
    setSaving(true);
    const res = await fetch("/api/staff", {
      method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify(form)
    });
    setSaving(false);
    if (res.ok) {
      toast.success(`Staff account created for ${form.first_name} ${form.last_name}`);
      setShowForm(false);
      setForm({ first_name:"", last_name:"", email:"", phone:"", role:"front_desk", department:"", password:"" });
      load();
    } else {
      const err = await res.json();
      toast.error(err.error || "Failed to create account.");
    }
  };

  const toggleActive = async (id: string, active: boolean) => {
    await fetch(`/api/staff/${id}`, {
      method:"PATCH", headers:{"Content-Type":"application/json"},
      body: JSON.stringify({ is_active: !active })
    });
    toast.success(`Staff account ${active ? "deactivated" : "activated"}.`);
    load();
  };

  const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));

  return (
    <StaffLayout>
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-bold text-2xl text-gray-900 flex items-center gap-2">
              <Shield className="h-6 w-6 text-brand" /> Staff Management
            </h1>
            <p className="text-gray-500 text-sm mt-0.5">Create and manage staff accounts — Admin only</p>
          </div>
          <button onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 brand-gradient text-white px-5 py-2.5 rounded-xl text-sm font-bold">
            <UserPlus className="h-4 w-4" /> Add Staff
          </button>
        </div>

        {/* Create staff form */}
        {showForm && (
          <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
            <h3 className="font-bold text-gray-900 mb-5">Create Staff Account</h3>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">First Name *</label>
                  <input value={form.first_name} onChange={e => set("first_name", e.target.value)} required
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-brand" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Last Name *</label>
                  <input value={form.last_name} onChange={e => set("last_name", e.target.value)} required
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-brand" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Email *</label>
                  <input type="email" value={form.email} onChange={e => set("email", e.target.value)} required
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-brand" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Phone</label>
                  <input value={form.phone} onChange={e => set("phone", e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-brand" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Role *</label>
                  <select value={form.role} onChange={e => set("role", e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-brand bg-white">
                    {ROLES.map(r => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Department</label>
                  <input value={form.department} onChange={e => set("department", e.target.value)}
                    placeholder="e.g. Outpatient"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-brand" />
                </div>
                <div className="col-span-2 md:col-span-3">
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Temporary Password *</label>
                  <div className="relative max-w-xs">
                    <input type={showPass ? "text" : "password"} value={form.password} onChange={e => set("password", e.target.value)} required
                      placeholder="Min 8 characters"
                      className="w-full border border-gray-200 rounded-xl px-3 pr-10 py-2.5 text-sm focus:outline-none focus:border-brand" />
                    <button type="button" onClick={() => setShowPass(!showPass)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                      {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">Staff should change this password after first login.</p>
                </div>
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setShowForm(false)}
                  className="px-5 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600">Cancel</button>
                <button type="submit" disabled={saving}
                  className="brand-gradient text-white px-7 py-2.5 rounded-xl text-sm font-bold disabled:opacity-60">
                  {saving ? "Creating…" : "Create Account"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Staff table */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <p className="font-bold text-gray-900 flex items-center gap-2"><Users className="h-4 w-4 text-brand" /> All Staff ({staff.length})</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  {["Name","Email","Role","Department","Status","Actions"].map(h => (
                    <th key={h} className="text-left px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {staff.length === 0 && (
                  <tr><td colSpan={6} className="text-center py-10 text-gray-400">No staff accounts yet.</td></tr>
                )}
                {staff.map(s => (
                  <tr key={s.id} className="hover:bg-gray-50">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 brand-gradient rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                          {s.first_name[0]}{s.last_name[0]}
                        </div>
                        <span className="font-semibold text-gray-900">{s.first_name} {s.last_name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-gray-500">{s.email}</td>
                    <td className="px-5 py-3">
                      <span className="bg-brand-50 text-brand px-2.5 py-0.5 rounded-full text-xs font-semibold">
                        {ROLE_LABELS[s.role] || s.role}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-gray-500">{s.department || "—"}</td>
                    <td className="px-5 py-3">
                      {s.is_active
                        ? <span className="flex items-center gap-1 text-green-600 text-xs font-semibold"><CheckCircle2 className="h-3.5 w-3.5" /> Active</span>
                        : <span className="flex items-center gap-1 text-red-500 text-xs font-semibold"><XCircle className="h-3.5 w-3.5" /> Inactive</span>
                      }
                    </td>
                    <td className="px-5 py-3">
                      <button onClick={() => toggleActive(s.id, s.is_active)}
                        className={`text-xs px-3 py-1.5 rounded-lg font-semibold border transition-all ${s.is_active ? "border-red-200 text-red-600 hover:bg-red-50" : "border-green-200 text-green-600 hover:bg-green-50"}`}>
                        {s.is_active ? "Deactivate" : "Activate"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </StaffLayout>
  );
}
