"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { User, Lock, Camera, Save, ArrowLeft, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import PortalFooter from "@/components/ui/PortalFooter";

interface Profile {
  id: string; first_name: string; last_name: string;
  email: string; phone?: string; avatar_url?: string;
  patient_number?: string; blood_group?: string; genotype?: string;
  allergies?: string; hmo_name?: string; hmo_number?: string; address?: string;
}

export default function PatientSettingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [form, setForm]       = useState({ first_name:"", last_name:"", phone:"", address:"",
    blood_group:"", genotype:"", allergies:"", hmo_name:"", hmo_number:"" });
  const [pwForm, setPwForm]   = useState({ current_password:"", new_password:"", confirm:"" });
  const [showPw, setShowPw]   = useState(false);
  const [saving, setSaving]   = useState(false);
  const [pwSaving, setPwSaving] = useState(false);
  const [tab, setTab]         = useState<"profile"|"password">("profile");

  useEffect(() => {
    if (status === "unauthenticated") router.push("/portal/login");
  }, [status, router]);

  useEffect(() => {
    if (status !== "authenticated") return;
    fetch("/api/settings/profile").then(r => r.json()).then(d => {
      if (d.profile) {
        setProfile(d.profile);
        setForm({
          first_name: d.profile.first_name || "",
          last_name:  d.profile.last_name  || "",
          phone:      d.profile.phone      || "",
          address:    d.profile.address    || "",
          blood_group:d.profile.blood_group|| "",
          genotype:   d.profile.genotype   || "",
          allergies:  d.profile.allergies  || "",
          hmo_name:   d.profile.hmo_name   || "",
          hmo_number: d.profile.hmo_number || "",
        });
      }
    });
  }, [status]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    const res = await fetch("/api/settings/profile", { method:"PATCH",
      headers:{"Content-Type":"application/json"}, body: JSON.stringify(form) });
    setSaving(false);
    if (res.ok) toast.success("Profile updated!");
    else { const d = await res.json(); toast.error(d.error || "Failed to update."); }
  };

  const handlePwChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pwForm.new_password !== pwForm.confirm) { toast.error("Passwords do not match."); return; }
    setPwSaving(true);
    const res = await fetch("/api/settings/profile", { method:"PATCH",
      headers:{"Content-Type":"application/json"},
      body: JSON.stringify({ current_password: pwForm.current_password, new_password: pwForm.new_password }) });
    setPwSaving(false);
    if (res.ok) { toast.success("Password changed!"); setPwForm({ current_password:"", new_password:"", confirm:"" }); }
    else { const d = await res.json(); toast.error(d.error || "Failed to change password."); }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    const fd = new FormData(); fd.append("file", file);
    fd.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_PRESET || "smartvision_avatars");
    fd.append("cloud_name",    process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD  || "");
    try {
      const res = await fetch(`https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD}/image/upload`, { method:"POST", body:fd });
      const d = await res.json();
      if (d.secure_url) {
        await fetch("/api/settings/profile", { method:"PATCH", headers:{"Content-Type":"application/json"},
          body: JSON.stringify({ avatar_url: d.secure_url }) });
        setProfile(p => p ? { ...p, avatar_url: d.secure_url } : p);
        toast.success("Avatar updated!");
      }
    } catch { toast.error("Upload failed."); }
  };

  const initials = profile ? `${profile.first_name[0]||""}${profile.last_name[0]||""}`.toUpperCase() : "?";

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="bg-white border-b border-gray-100 px-6 py-4 flex items-center gap-4">
        <Link href="/portal/dashboard" className="flex items-center gap-2 text-gray-500 hover:text-brand text-sm transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to Dashboard
        </Link>
        <h1 className="font-bold text-gray-900 text-lg">Account Settings</h1>
      </div>

      <div className="flex-1 max-w-3xl mx-auto w-full px-6 py-8">
        {/* Avatar */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6 flex items-center gap-6">
          <div className="relative">
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt="Avatar" className="w-20 h-20 rounded-full object-cover border-4 border-brand-100" />
            ) : (
              <div className="w-20 h-20 rounded-full brand-gradient flex items-center justify-center text-white text-2xl font-bold border-4 border-brand-100">
                {initials}
              </div>
            )}
            <label className="absolute -bottom-1 -right-1 w-8 h-8 bg-white rounded-full border-2 border-brand-200 flex items-center justify-center cursor-pointer hover:bg-brand-50 transition-all">
              <Camera className="h-4 w-4 text-brand" />
              <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
            </label>
          </div>
          <div>
            <p className="font-bold text-gray-900 text-lg">{profile?.first_name} {profile?.last_name}</p>
            <p className="text-gray-500 text-sm">{profile?.email}</p>
            {profile?.patient_number && <p className="text-brand text-xs font-mono mt-1">{profile.patient_number}</p>}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {(["profile","password"] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all capitalize ${
                tab===t ? "brand-gradient text-white shadow" : "bg-white border border-gray-200 text-gray-600 hover:border-brand hover:text-brand"
              }`}>
              {t === "profile" ? <User className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
              {t === "profile" ? "Edit Profile" : "Change Password"}
            </button>
          ))}
        </div>

        {/* Profile form */}
        {tab === "profile" && (
          <form onSubmit={handleSave} className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[{k:"first_name",l:"First Name"},{k:"last_name",l:"Last Name"},{k:"phone",l:"Phone"},{k:"address",l:"Address"}].map(({k,l})=>(
                <div key={k}>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">{l}</label>
                  <input type="text" value={(form as Record<string,string>)[k]}
                    onChange={e => setForm(p => ({...p,[k]:e.target.value}))}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-brand" />
                </div>
              ))}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {[{k:"blood_group",l:"Blood Group"},{k:"genotype",l:"Genotype"},{k:"allergies",l:"Allergies"},
                {k:"hmo_name",l:"HMO Name"},{k:"hmo_number",l:"HMO Number"}].map(({k,l})=>(
                <div key={k}>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">{l}</label>
                  <input type="text" value={(form as Record<string,string>)[k]}
                    onChange={e => setForm(p => ({...p,[k]:e.target.value}))}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-brand" />
                </div>
              ))}
            </div>
            <button type="submit" disabled={saving}
              className="flex items-center gap-2 brand-gradient text-white rounded-xl px-6 py-3 font-bold text-sm disabled:opacity-50">
              <Save className="h-4 w-4" /> {saving ? "Saving…" : "Save Changes"}
            </button>
          </form>
        )}

        {/* Password form */}
        {tab === "password" && (
          <form onSubmit={handlePwChange} className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5">
            {[{k:"current_password",l:"Current Password"},{k:"new_password",l:"New Password"},{k:"confirm",l:"Confirm New Password"}].map(({k,l})=>(
              <div key={k}>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">{l}</label>
                <div className="relative">
                  <input type={showPw ? "text" : "password"} value={(pwForm as Record<string,string>)[k]}
                    onChange={e => setPwForm(p => ({...p,[k]:e.target.value}))} required
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-brand pr-10" />
                  <button type="button" onClick={() => setShowPw(!showPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            ))}
            <p className="text-gray-400 text-xs">Minimum 8 characters. Use a mix of letters, numbers, and symbols.</p>
            <button type="submit" disabled={pwSaving}
              className="flex items-center gap-2 brand-gradient text-white rounded-xl px-6 py-3 font-bold text-sm disabled:opacity-50">
              <Lock className="h-4 w-4" /> {pwSaving ? "Updating…" : "Update Password"}
            </button>
          </form>
        )}
      </div>
      <PortalFooter />
    </div>
  );
}
