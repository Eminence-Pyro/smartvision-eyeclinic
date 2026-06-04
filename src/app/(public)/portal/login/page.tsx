"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Mail, Lock, Phone } from "lucide-react";
import { toast } from "sonner";

type Mode = "password" | "otp";

export default function PatientLoginPage() {
  const router = useRouter();
  const [mode, setMode]           = useState<Mode>("password");
  const [email, setEmail]         = useState("");
  const [password, setPassword]   = useState("");
  const [showPass, setShowPass]   = useState(false);
  const [otp, setOtp]             = useState("");
  const [otpSent, setOtpSent]     = useState(false);
  const [loading, setLoading]     = useState(false);

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await signIn("patient-login", { email, password, redirect: false });
    setLoading(false);
    if (res?.ok) {
      toast.success("Welcome back!");
      router.push("/portal/dashboard");
    } else {
      toast.error("Invalid email or password.");
    }
  };

  const handleSendOTP = async () => {
    if (!email) { toast.error("Enter your email first."); return; }
    setLoading(true);
    const res = await fetch("/api/auth/send-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    setLoading(false);
    if (res.ok) { setOtpSent(true); toast.success("OTP sent to your email!"); }
    else { toast.error("Email not found. Please register first."); }
  };

  const handleOTPLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await fetch("/api/auth/verify-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, otp }),
    });
    setLoading(false);
    if (res.ok) {
      const data = await res.json();
      await signIn("patient-login", { email, password: data.tempPassword, redirect: false });
      router.push("/portal/dashboard");
    } else {
      toast.error("Invalid or expired OTP.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 to-white flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 brand-gradient rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Eye className="h-8 w-8 text-white" />
          </div>
          <h1 className="font-serif font-black text-2xl text-gray-900">Patient Portal</h1>
          <p className="text-gray-500 text-sm mt-1">Anya Specialist Eye Clinic</p>
        </div>

        <div className="bg-white rounded-3xl shadow-xl p-8">
          {/* Mode toggle */}
          <div className="flex rounded-xl border border-gray-200 p-1 mb-6">
            <button onClick={() => setMode("password")}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${mode === "password" ? "brand-gradient text-white shadow" : "text-gray-500 hover:text-gray-700"}`}>
              Password
            </button>
            <button onClick={() => setMode("otp")}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${mode === "otp" ? "brand-gradient text-white shadow" : "text-gray-500 hover:text-gray-700"}`}>
              OTP Login
            </button>
          </div>

          {/* Password form */}
          {mode === "password" && (
            <form onSubmit={handlePasswordLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                    placeholder="your@email.com"
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-brand" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input type={showPass ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} required
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-brand" />
                  <button type="button" onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <button type="submit" disabled={loading}
                className="w-full brand-gradient text-white py-3.5 rounded-xl font-bold text-sm shadow hover:opacity-90 disabled:opacity-60 transition-all">
                {loading ? "Signing in…" : "Sign In"}
              </button>
            </form>
          )}

          {/* OTP form */}
          {mode === "otp" && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Email</label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-brand" />
                  </div>
                  <button onClick={handleSendOTP} disabled={loading || otpSent}
                    className="brand-gradient text-white px-4 rounded-xl text-sm font-semibold whitespace-nowrap disabled:opacity-60">
                    {otpSent ? "Sent ✓" : "Send OTP"}
                  </button>
                </div>
              </div>
              {otpSent && (
                <form onSubmit={handleOTPLogin} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">6-Digit OTP</label>
                    <input type="text" value={otp} onChange={e => setOtp(e.target.value)} maxLength={6} required
                      placeholder="123456"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-center font-mono text-lg tracking-widest focus:outline-none focus:border-brand" />
                  </div>
                  <button type="submit" disabled={loading}
                    className="w-full brand-gradient text-white py-3.5 rounded-xl font-bold text-sm disabled:opacity-60">
                    {loading ? "Verifying…" : "Verify & Sign In"}
                  </button>
                </form>
              )}
            </div>
          )}

          <div className="mt-5 text-center text-sm text-gray-500">
            Don&apos;t have an account?{" "}
            <Link href="/portal/register" className="text-brand font-semibold hover:underline">Register here</Link>
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 mt-4">
          Staff?{" "}
          <Link href="/staff/login" className="text-brand hover:underline">Click here to login</Link>
        </p>
        <p className="text-center mt-3">
          <Link href="/" className="text-xs text-gray-400 hover:text-brand">← Back to website</Link>
        </p>
      </div>
    </div>
  );
}
