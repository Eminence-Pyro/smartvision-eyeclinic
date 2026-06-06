"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Loader2, Mail, ArrowLeft } from "lucide-react";
import Logo from "@/components/ui/Logo";
import { toast } from "sonner";

export default function PatientLoginPage() {
  const router   = useRouter();
  const [tab, setTab]         = useState<"password"|"otp">("password");
  const [email, setEmail]     = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp]         = useState("");
  const [showPw, setShowPw]   = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handlePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await signIn("patient-credentials", { email, password, redirect: false });
    setLoading(false);
    if (res?.ok) router.push("/portal/dashboard");
    else toast.error("Invalid email or password.");
  };

  const sendOtp = async () => {
    if (!email) { toast.error("Enter your email first."); return; }
    setLoading(true);
    const res = await fetch("/api/auth/send-otp", {
      method:"POST", headers:{"Content-Type":"application/json"},
      body: JSON.stringify({ email, type:"patient" })
    });
    setLoading(false);
    if (res.ok) { setOtpSent(true); toast.success("OTP sent to your email!"); }
    else toast.error("Could not send OTP. Check your email address.");
  };

  const handleOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const verifyRes = await fetch("/api/auth/verify-otp", {
      method:"POST", headers:{"Content-Type":"application/json"},
      body: JSON.stringify({ email, otp, type:"patient" })
    });
    const data = await verifyRes.json();
    if (!verifyRes.ok) { setLoading(false); toast.error("Invalid or expired OTP."); return; }
    const res = await signIn("patient-credentials", { email, password: data.temp_token, redirect: false });
    setLoading(false);
    if (res?.ok) router.push("/portal/dashboard");
    else toast.error("Login failed after OTP verification.");
  };

  const handleGoogle = () => signIn("google", { callbackUrl: "/portal/dashboard" });

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 via-white to-accent-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="mb-8 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-gray-500 hover:text-brand text-sm font-medium">
            <ArrowLeft className="h-4 w-4" /> Back to website
          </Link>
          <Logo size={32} showText={false} />
        </div>

        <div className="bg-white rounded-3xl shadow-2xl shadow-brand-700/10 border border-gray-100 p-8">
          {/* Header */}
          <div className="text-center mb-7">
            <div className="w-14 h-14 brand-gradient rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-brand-700/25">
              <Logo size={32} showText={false} />
            </div>
            <h1 className="font-serif font-black text-2xl text-gray-900">Patient Portal</h1>
            <p className="text-gray-500 text-sm mt-1">Sign in to your Anya Eye Clinic account</p>
          </div>

          {/* Google sign-in */}
          <button onClick={handleGoogle}
            className="w-full flex items-center justify-center gap-3 border-2 border-gray-200 rounded-xl py-3.5 text-sm font-semibold text-gray-700 hover:border-brand hover:text-brand hover:bg-brand-50 transition-all mb-5">
            <svg viewBox="0 0 24 24" className="w-5 h-5">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>

          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px bg-gray-200" /><span className="text-xs text-gray-400 font-medium">or sign in with email</span><div className="flex-1 h-px bg-gray-200" />
          </div>

          {/* Tabs */}
          <div className="flex gap-1 p-1 bg-gray-100 rounded-xl mb-5">
            {[["password","Password"],["otp","OTP Login"]].map(([id, label]) => (
              <button key={id} onClick={() => setTab(id as "password"|"otp")}
                className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${tab === id ? "bg-white shadow text-brand" : "text-gray-500 hover:text-gray-700"}`}>
                {label}
              </button>
            ))}
          </div>

          {tab === "password" ? (
            <form onSubmit={handlePassword} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Email Address</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                  placeholder="you@example.com"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand" />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Password</label>
                  <Link href="/portal/forgot-password" className="text-xs text-brand hover:underline">Forgot password?</Link>
                </div>
                <div className="relative">
                  <input type={showPw ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} required
                    placeholder="Your password"
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 pr-11 text-sm focus:outline-none focus:border-brand" />
                  <button type="button" onClick={() => setShowPw(!showPw)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-brand">
                    {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <button type="submit" disabled={loading}
                className="w-full brand-gradient text-white py-3.5 rounded-xl font-bold text-sm disabled:opacity-60 flex items-center justify-center gap-2 shadow-lg shadow-brand-700/20">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                {loading ? "Signing in…" : "Sign In"}
              </button>
            </form>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Email Address</label>
                <div className="flex gap-2">
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="flex-1 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand" />
                  <button onClick={sendOtp} disabled={loading || otpSent}
                    className="brand-gradient text-white px-4 rounded-xl text-sm font-bold disabled:opacity-60 flex-shrink-0">
                    {otpSent ? "Sent ✓" : loading ? "…" : "Send OTP"}
                  </button>
                </div>
              </div>
              {otpSent && (
                <form onSubmit={handleOtp}>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Enter OTP</label>
                  <input value={otp} onChange={e => setOtp(e.target.value)} maxLength={6}
                    placeholder="6-digit code from your email"
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand mb-4 tracking-widest text-center text-lg font-bold" />
                  <button type="submit" disabled={loading || otp.length < 6}
                    className="w-full brand-gradient text-white py-3.5 rounded-xl font-bold text-sm disabled:opacity-60">
                    {loading ? "Verifying…" : "Verify & Sign In"}
                  </button>
                </form>
              )}
            </div>
          )}

          <p className="text-center text-sm text-gray-500 mt-5">
            Don't have an account?{" "}
            <Link href="/portal/register" className="text-brand font-semibold hover:underline">Create one free</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
