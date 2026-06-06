"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Loader2, Shield, ArrowLeft } from "lucide-react";
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
    else toast.error("Invalid email or password, or account inactive.");
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-6 relative overflow-hidden"
      style={{ backgroundImage:"url(https://images.unsplash.com/photo-1551190822-a9333d879b1f?w=1600&q=80)", backgroundSize:"cover", backgroundPosition:"center" }}>
      <div className="absolute inset-0 bg-gray-950/88" />

      <div className="relative z-10 w-full max-w-md">
        <div className="mb-8">
          <Link href="/" className="flex items-center gap-2 text-gray-400 hover:text-white text-sm font-medium">
            <ArrowLeft className="h-4 w-4" /> Back to website
          </Link>
        </div>

        <div className="bg-white/5 backdrop-blur border border-white/10 rounded-3xl p-8">
          <div className="text-center mb-8">
            <Logo size={40} textColor="white" className="justify-center mb-4" />
            <div className="inline-flex items-center gap-2 bg-brand/20 border border-brand-500/30 text-brand-300 text-xs px-3 py-1.5 rounded-full mb-3">
              <Shield className="h-3.5 w-3.5" /> Staff Access Only
            </div>
            <h1 className="font-serif font-black text-2xl text-white">Staff Portal</h1>
            <p className="text-gray-400 text-sm mt-1">Sign in with your clinic credentials</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Email Address</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                placeholder="you@anyaeyeclinic.com"
                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder:text-gray-500 text-sm focus:outline-none focus:border-brand-400" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Password</label>
              <div className="relative">
                <input type={showPw ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} required
                  placeholder="Your password"
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 pr-11 text-white placeholder:text-gray-500 text-sm focus:outline-none focus:border-brand-400" />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-brand-400">
                  {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading}
              className="w-full brand-gradient text-white py-3.5 rounded-xl font-bold text-sm disabled:opacity-60 flex items-center justify-center gap-2 shadow-lg shadow-brand-700/30 mt-2">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {loading ? "Signing in…" : "Sign In to Staff Portal"}
            </button>
          </form>

          <p className="text-center text-xs text-gray-500 mt-6">
            Staff accounts are created by Admin only.
            <br />Not a patient? <Link href="/portal/login" className="text-brand-400 hover:underline">Patient login →</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
