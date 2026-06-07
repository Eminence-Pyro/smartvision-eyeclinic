"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Loader2, Shield } from "lucide-react";
import Logo from "@/components/ui/Logo";
import { toast } from "sonner";

export default function StaffLoginPage() {
  const router = useRouter();
  const [email, setEmail]     = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw]   = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await signIn("staff-credentials", { email, password, redirect: false });
    setLoading(false);
    if (res?.ok) router.push("/staff/dashboard");
    else toast.error("Invalid email or password. Check your credentials.");
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 brand-gradient rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-2xl shadow-brand-900/60">
            <Logo size={36} showText={false} />
          </div>
          <h1 className="font-serif font-black text-2xl text-white">Staff Portal</h1>
          <p className="text-gray-500 text-sm mt-1">Anya Specialist Eye Clinic · SmartVision</p>
        </div>

        <div className="bg-gray-900 rounded-3xl border border-gray-800 p-8">
          <div className="flex items-center gap-2 bg-brand/10 border border-brand-800/50 rounded-xl px-4 py-3 mb-6">
            <Shield className="h-4 w-4 text-brand-400 flex-shrink-0" />
            <p className="text-brand-300 text-xs">This portal is for authorised clinic staff only. Patient access is at <Link href="/portal/login" className="underline">Patient Portal</Link>.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">Staff Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white text-sm focus:outline-none focus:border-brand placeholder-gray-600"
                placeholder="yourname@anya.com" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">Password</label>
              <div className="relative">
                <input type={showPw ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} required
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white text-sm focus:outline-none focus:border-brand pr-11 placeholder-gray-600"
                  placeholder="Your password" />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                  {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading}
              className="w-full brand-gradient text-white rounded-xl py-3.5 font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-50 hover:opacity-90 transition-all shadow-lg shadow-brand-900/30">
              {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Signing in…</> : "Sign In to Staff Portal"}
            </button>
          </form>
        </div>

        <p className="text-center text-gray-600 text-xs mt-6">
          Are you a patient? <Link href="/portal/login" className="text-brand-400 hover:text-brand-300">Patient Portal →</Link>
        </p>
      </div>
    </div>
  );
}
