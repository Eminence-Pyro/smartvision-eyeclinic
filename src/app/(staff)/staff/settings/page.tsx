"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { User, Lock, Camera, Save, Eye, EyeOff } from "lucide-react";
import StaffLayout from "@/components/staff/StaffLayout";

interface Profile {
  id: string; first_name: string; last_name: string; email: string;
  phone?: string; role: string; department?: string; avatar_url?: string;
}

export default function StaffSettingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [form, setForm]       = useState({ first_name:"", last_name:"", phone:"" });
  const [pwForm, setPwForm]   = useState({ current_password:"", new_password:"", confirm:"" });
  const [showPw, setShowPw]   = useState(false);
  const [saving, setSaving]   = useState(false);
  const [pwSaving, setPwSaving] = useState(false);
  const [tab, setTab]         = useState<"profile"|"password">("profile");

  useEffect(() => {
    if (status === "unauthenticated") router.push("/staff/login");
  }, [status, router]);

  useEffect(() => {
    if (status !== "authenticated") return;
    fetch("/api/settings/profile").then(r => r.json()).then(d => {
      if (d.profile) {
        setProfile(d.profile);
        setForm({ first_name:d.profile.first_name||"", last_name:d.profile.last_name||"", phone:d.profile.phone||"" });
      }
    });
  }, [status]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    const res = await fetch("/api/settings/profile", { method:"PATCH",
      headers:{"Content-Type":"application/json"}, body: JSON.stringify(form) });
    setSaving(false);
    if (res.ok) toast.success("Profile updated!");
    else { const d = await res.json(); toast.error(d.error || "Failed."); }
  };

  const handlePwChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pwForm.new_password !== pwForm.confirm) { toast.error("Passwords do not match."); return; }
    setPwSaving(true);
    const res = await fetch("/api/settings/profile", { method:"PATCH",
      headers:{"Content-Type":"application/json"},
      body: JSON.stringify({ current_password:pwForm.current_password, new_password:pwForm.new_password }) });
    setPwSaving(false);
    if (res.ok) { toast.success("Password changed!"); setPwForm({ current_password:"", new_password:"", confirm:"" }); }
    else { const d = await res.json(); toast.error(d.error || "Failed."); }
  };

  const handleAvatar = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    const fd = new FormData(); fd.append("file", file);
    fd.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_PRESET || "smartvision_avatars");
    fd.append("cloud_name",    process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD  || "");
    try {
      const res = await fetch(`https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD}/image/upload`,{ method:"POST", body:fd });
      const d = await res.json();
      if (d.secure_url) {
        await fetch("/api/settings/profile",{ method:"PATCH", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ avatar_url:d.secure_url }) });
        setProfile(p => p ? {...p, avatar_url:d.secure_url} : p);
        toast.success("Avatar updated!");
      }
    } catch { toast.error("Upload failed."); }
  };

  const ROLE_LABELS: Record<string,string> = {
    admin:"Administrator", doctor:"Doctor", front_desk:"Front Desk",
    va_room:"VA Room", accounts:"Accounts", scan_room:"Scan Room",
    theatre:"Theatre", pharmacy:"Pharmacy"
  };
  const initials = profile ? `${profile.first_name[0]||""}${profile.last_name[0]||""}`.toUpperCase() : "?";

  return (
    <StaffLayout>
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <h1 className="font-bold text-2xl text-gray-900">Account Settings</h1>
          <p className="text-gray-500 text-sm mt-0.5">Manage your profile, avatar and password</p>
        </div>

        {/* Avatar card */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6 flex items-center gap-6">
          <div className="relative">
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt="Avatar" className="w-20 h-20 rounded-full object-cover border-4 border-brand-100" />
            ) : (
              <div className="w-20 h-20 rounded-full brand-gradient flex items-center justify-center text-white text-2xl font-bold">
                {initials}
              </div>
            )}
            <label className="absolute -bottom-1 -right-1 w-8 h-8 bg-white rounded-full border-2 border-brand-200 flex items-center justify-center cursor-pointer hover:bg-brand-50 transition-all">
              <Camera className="h-4 w-4 text-brand" />
              <input type="file" accept="image/*" onChange={handleAvatar} className="hidden" />
            </label>
          </div>
          <div>
            <p className="font-bold text-gray-900 text-lg">{profile?.first_name} {profile?.last_name}</p>
            <p className="text-gray-500 text-sm">{profile?.email}</p>
            <span className="inline-block mt-1 bg-brand-50 text-brand text-xs font-bold px-3 py-0.5 rounded-full">
              {ROLE_LABELS[profile?.role||""] || profile?.role}
            </span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {(["profile","password"] as const).map(t=>(
            <button key={t} onClick={()=>setTab(t)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                tab===t ? "brand-gradient text-white shadow" : "bg-white border border-gray-200 text-gray-600 hover:border-brand hover:text-brand"
              }`}>
              {t==="profile" ? <User className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
              {t==="profile" ? "Edit Profile" : "Change Password"}
            </button>
          ))}
        </div>

        {tab === "profile" && (
          <form onSubmit={handleSave} className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
            {[{k:"first_name",l:"First Name"},{k:"last_name",l:"Last Name"},{k:"phone",l:"Phone"}].map(({k,l})=>(
              <div key={k}>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">{l}</label>
                <input type="text" value={(form as Record<string,string>)[k]}
                  onChange={e=>setForm(p=>({...p,[k]:e.target.value}))}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-brand" />
              </div>
            ))}
            <button type="submit" disabled={saving}
              className="flex items-center gap-2 brand-gradient text-white rounded-xl px-6 py-3 font-bold text-sm disabled:opacity-50">
              <Save className="h-4 w-4" /> {saving?"Saving…":"Save Changes"}
            </button>
          </form>
        )}

        {tab === "password" && (
          <form onSubmit={handlePwChange} className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
            {[{k:"current_password",l:"Current Password"},{k:"new_password",l:"New Password"},{k:"confirm",l:"Confirm New Password"}].map(({k,l})=>(
              <div key={k}>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">{l}</label>
                <div className="relative">
                  <input type={showPw?"text":"password"} value={(pwForm as Record<string,string>)[k]}
                    onChange={e=>setPwForm(p=>({...p,[k]:e.target.value}))} required
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-brand pr-10" />
                  <button type="button" onClick={()=>setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                    {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            ))}
            <button type="submit" disabled={pwSaving}
              className="flex items-center gap-2 brand-gradient text-white rounded-xl px-6 py-3 font-bold text-sm disabled:opacity-50">
              <Lock className="h-4 w-4" /> {pwSaving?"Updating…":"Update Password"}
            </button>
          </form>
        )}
      </div>
    </StaffLayout>
  );
}
