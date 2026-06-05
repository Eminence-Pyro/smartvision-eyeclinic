"use client";
import Link from "next/link";
import { useState } from "react";
import {
  Phone, MapPin, Mail, Clock, ChevronRight,
  Star, Shield, Heart, Activity, Users, Award,
  MessageCircle, Calendar, ArrowRight, Menu, X, Send, Bot, Loader2
} from "lucide-react";
import Logo from "@/components/ui/Logo";

const NAV_LINKS = [
  { label: "Home",     href: "#home"     },
  { label: "About",    href: "#about"    },
  { label: "Services", href: "#services" },
  { label: "Contact",  href: "#contact"  },
];

const SERVICES = [
  { icon: "👁️", title: "Comprehensive Eye Exam",  desc: "Detailed vision and eye health assessment by our specialist team." },
  { icon: "🔬", title: "Phacoemulsification",      desc: "State-of-the-art cataract surgery with rapid recovery." },
  { icon: "💧", title: "Glaucoma Surgery",         desc: "Trabeculectomy and other glaucoma procedures to protect your sight." },
  { icon: "📷", title: "OCT Scanning",             desc: "High-resolution optical coherence tomography for retinal imaging." },
  { icon: "🎯", title: "Gonioscopy",               desc: "Precision drainage-angle assessment for glaucoma management." },
  { icon: "📏", title: "Pachymetry",               desc: "Corneal thickness measurement essential for glaucoma & LASIK." },
  { icon: "🌐", title: "Fundus Photography",       desc: "Detailed retinal imaging for diabetic eye disease and AMD." },
  { icon: "🏥", title: "Community Outreach",       desc: "Free eye care camps and telemedicine for underserved communities." },
];

const STATS = [
  { value: "5,000+", label: "Patients Served"    },
  { value: "500+",   label: "Surgeries Done"      },
  { value: "15+",    label: "Years Experience"    },
  { value: "98%",    label: "Patient Satisfaction"},
];

type ChatMsg = { role: "user" | "ai"; text: string };

export default function LandingPage() {
  const [menuOpen, setMenuOpen]   = useState(false);
  const [chatOpen, setChatOpen]   = useState(false);
  const [chatMsgs, setChatMsgs]   = useState<ChatMsg[]>([
    { role: "ai", text: "Hi! I'm Zinny 👋 — your Anya Eye Clinic assistant. Ask me anything about our services, location, or booking!" }
  ]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setLoading] = useState(false);

  const scrollTo = (href: string) => {
    setMenuOpen(false);
    document.querySelector(href)?.scrollIntoView({ behavior: "smooth" });
  };

  const sendChat = async () => {
    const msg = chatInput.trim();
    if (!msg || chatLoading) return;
    setChatInput("");
    setChatMsgs(p => [...p, { role: "user", text: msg }]);
    setLoading(true);
    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: msg, history: chatMsgs.slice(-6).map(m => ({ role: m.role === "ai" ? "assistant" : "user", content: m.text })) }),
      });
      const data = await res.json();
      setChatMsgs(p => [...p, { role: "ai", text: data.reply || "Sorry, try again in a moment." }]);
    } catch {
      setChatMsgs(p => [...p, { role: "ai", text: "Connection issue — please try again." }]);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-white text-gray-900">

      {/* ── Navbar ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Logo size={36} />

          <div className="hidden md:flex items-center gap-7">
            {NAV_LINKS.map(l => (
              <button key={l.href} onClick={() => scrollTo(l.href)}
                className="text-gray-600 hover:text-brand text-sm font-medium transition-colors">
                {l.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <Link href="/portal/login"
              className="hidden md:block text-brand border border-brand rounded-full px-4 py-2 text-sm font-semibold hover:bg-brand-50 transition-all">
              Patient Portal
            </Link>
            <button onClick={() => scrollTo("#contact")}
              className="brand-gradient text-white rounded-full px-5 py-2 text-sm font-bold shadow-lg shadow-brand-700/25 hover:opacity-90 transition-all">
              Book Appointment
            </button>
            <button className="md:hidden" onClick={() => setMenuOpen(!menuOpen)}>
              {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
        {menuOpen && (
          <div className="md:hidden bg-white border-t border-gray-100 px-6 py-4 space-y-3">
            {NAV_LINKS.map(l => (
              <button key={l.href} onClick={() => scrollTo(l.href)}
                className="block w-full text-left text-gray-700 py-2 font-medium">
                {l.label}
              </button>
            ))}
            <Link href="/portal/login" className="block text-brand font-semibold py-2">Patient Portal</Link>
          </div>
        )}
      </nav>

      {/* ── Hero ── */}
      <section id="home" className="pt-28 pb-20 px-6 relative overflow-hidden">
        {/* Background orbs */}
        <div className="absolute top-20 right-0 w-96 h-96 rounded-full bg-brand-100 opacity-30 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-72 h-72 rounded-full bg-accent-100 opacity-25 blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-14 items-center relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 bg-brand-50 border border-brand-200 text-brand text-xs font-bold px-4 py-1.5 rounded-full mb-6">
              <Star className="h-3.5 w-3.5" /> Specialist Eye Care · Nigeria
            </div>
            <h1 className="font-serif font-black text-5xl md:text-6xl text-gray-900 leading-tight mb-6">
              Your Vision is Our<br />
              <span className="brand-gradient-text">Priority.</span>
            </h1>
            <p className="text-gray-500 text-lg leading-relaxed mb-8 max-w-lg">
              Anya Specialist Eye Clinic delivers world-class ophthalmology care —
              from routine consultations to complex surgeries — with compassion and precision.
            </p>
            <div className="flex flex-wrap gap-4">
              <button onClick={() => scrollTo("#contact")}
                className="flex items-center gap-2 brand-gradient text-white rounded-full px-7 py-3.5 font-bold shadow-xl shadow-brand-700/25 hover:opacity-90 transition-all">
                Book Appointment <ArrowRight className="h-4 w-4" />
              </button>
              <button onClick={() => scrollTo("#services")}
                className="flex items-center gap-2 border-2 border-brand text-brand rounded-full px-7 py-3.5 font-semibold hover:bg-brand-50 transition-all">
                Our Services <ChevronRight className="h-4 w-4" />
              </button>
            </div>
            <div className="flex flex-wrap gap-6 mt-10">
              {[
                { icon: Shield, text: "Experienced Specialists" },
                { icon: Heart,  text: "Patient-Centred Care"   },
                { icon: Award,  text: "Modern Equipment"       },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-2 text-gray-600 text-sm">
                  <Icon className="h-4 w-4 text-brand" /> {text}
                </div>
              ))}
            </div>
          </div>

          {/* Hero graphic — IOL diagram */}
          <div className="relative flex items-center justify-center">
            <div className="w-80 h-80 rounded-full brand-gradient flex items-center justify-center shadow-2xl shadow-brand-700/30 relative">
              {/* Animated ring */}
              <div className="absolute inset-0 rounded-full border-4 border-dashed border-white/20 logo-ring" />
              <div className="text-center text-white p-8">
                <Logo size={80} showText={false} />
                <p className="text-white font-bold text-lg mt-4">Anya Specialist</p>
                <p className="text-white/60 text-xs tracking-widest uppercase mt-1">Eye Clinic</p>
              </div>
            </div>
            {/* Floating stat cards */}
            <div className="absolute -bottom-4 -left-4 bg-white rounded-2xl shadow-xl p-4 flex items-center gap-3">
              <div className="w-10 h-10 bg-accent-100 rounded-xl flex items-center justify-center">
                <Activity className="h-5 w-5 text-accent" />
              </div>
              <div>
                <p className="font-bold text-gray-900 text-sm">500+ Surgeries</p>
                <p className="text-gray-500 text-xs">Successfully performed</p>
              </div>
            </div>
            <div className="absolute -top-4 -right-4 bg-white rounded-2xl shadow-xl p-4 flex items-center gap-3">
              <div className="w-10 h-10 bg-brand-100 rounded-xl flex items-center justify-center">
                <Users className="h-5 w-5 text-brand" />
              </div>
              <div>
                <p className="font-bold text-gray-900 text-sm">5,000+ Patients</p>
                <p className="text-gray-500 text-xs">Trust our care</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats bar ── */}
      <section className="py-12 brand-gradient">
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {STATS.map(s => (
            <div key={s.label}>
              <p className="text-3xl font-black text-white mb-1">{s.value}</p>
              <p className="text-white/60 text-sm">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Services ── */}
      <section id="services" className="py-24 bg-gray-50 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-brand text-sm font-bold uppercase tracking-widest mb-3">Our Services</p>
            <h2 className="font-serif font-black text-4xl text-gray-900">
              Comprehensive Eye Care <span className="brand-gradient-text">Under One Roof</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {SERVICES.map(svc => (
              <div key={svc.title}
                className="bg-white rounded-2xl p-6 border border-gray-100 card-hover group hover:border-brand-200">
                <div className="text-3xl mb-4">{svc.icon}</div>
                <h3 className="font-bold text-gray-900 mb-2 group-hover:text-brand transition-colors">{svc.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{svc.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── About ── */}
      <section id="about" className="py-24 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="w-full max-w-md mx-auto">
            <div className="aspect-square rounded-3xl bg-gradient-to-br from-brand-50 to-accent-50 border border-brand-100 flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 opacity-5 brand-gradient" />
              <div className="text-center p-10 relative z-10">
                <div className="w-24 h-24 brand-gradient rounded-full flex items-center justify-center mx-auto mb-4 shadow-xl shadow-brand-700/25">
                  <Logo size={52} showText={false} />
                </div>
                <p className="text-brand font-bold text-lg">Dr. Anya</p>
                <p className="text-gray-500 text-sm">CMD · Consultant Ophthalmologist</p>
                <p className="text-gray-400 text-xs mt-2">[Place doctor photo here]</p>
              </div>
            </div>
          </div>
          <div>
            <div className="flex items-center gap-3 mb-4">
              <span className="text-brand text-xs font-bold tracking-widest uppercase">About the Clinic</span>
              <div className="h-px flex-1 bg-brand-100" />
            </div>
            <h2 className="font-serif font-black text-4xl text-gray-900 mb-4 leading-tight">
              Expert Eye Care, <span className="brand-gradient-text">Decades of Trust</span>
            </h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              Anya Specialist Eye Clinic is a leading ophthalmology centre dedicated to comprehensive,
              compassionate eye care. Led by Dr. Anya — our Consultant Ophthalmologist and Medical Director
              with over 15 years of specialist experience — we combine modern technology with personal attention.
            </p>
            <p className="text-gray-600 leading-relaxed mb-6">
              From simple refractions to complex surgeries like phacoemulsification and glaucoma procedures,
              we handle all aspects of eye health. Our community outreach programme extends services to
              underserved populations across the region.
            </p>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Consultations", value: "Mon–Sat, 8am–5pm" },
                { label: "Emergencies",   value: "24/7 On-Call"     },
                { label: "Surgery Days",  value: "Tue & Thu"        },
                { label: "Outreach",      value: "Monthly"          },
              ].map(item => (
                <div key={item.label} className="bg-brand-50 rounded-xl p-3 border border-brand-100">
                  <p className="text-brand text-xs font-bold uppercase tracking-wide">{item.label}</p>
                  <p className="text-gray-700 text-sm font-medium mt-0.5">{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Contact ── */}
      <section id="contact" className="py-24 bg-gray-50 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-brand text-sm font-bold uppercase tracking-widest mb-3">Get in Touch</p>
            <h2 className="font-serif font-black text-4xl text-gray-900">
              Ready to <span className="brand-gradient-text">Book an Appointment?</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <div className="space-y-4">
              {[
                { icon: Phone,  label: "Phone",   value: "+234 XXX XXX XXXX",         href: "tel:+234" },
                { icon: Mail,   label: "Email",   value: "info@anyaeyeclinic.com",     href: "mailto:info@anyaeyeclinic.com" },
                { icon: MapPin, label: "Address", value: "Anya Specialist Eye Clinic, Nigeria", href: "#" },
                { icon: Clock,  label: "Hours",   value: "Mon–Sat 8am–5pm · 24/7 emergencies", href: "#" },
              ].map(({ icon: Icon, label, value, href }) => (
                <div key={label} className="flex items-start gap-4 p-4 bg-white rounded-xl border border-gray-100 shadow-sm">
                  <div className="w-10 h-10 brand-gradient rounded-xl flex items-center justify-center flex-shrink-0">
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-brand text-xs font-bold uppercase tracking-wide">{label}</p>
                    <a href={href} className="text-gray-700 text-sm hover:text-brand transition-colors">{value}</a>
                  </div>
                </div>
              ))}
            </div>
            <div className="brand-gradient rounded-3xl p-8 text-white text-center flex flex-col justify-center relative overflow-hidden">
              <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 80% 20%, white 0%, transparent 60%)" }} />
              <div className="relative z-10">
                <Logo size={48} showText={false} className="justify-center mb-4" />
                <h3 className="font-serif font-black text-2xl mb-3">Book Online</h3>
                <p className="text-white/80 mb-6 leading-relaxed text-sm">
                  Create a patient account to book appointments, pay consultation fees, and access your health records anytime.
                </p>
                <Link href="/portal/register"
                  className="bg-white text-brand font-bold rounded-full px-8 py-3.5 hover:bg-brand-50 transition-all inline-block mb-3 shadow-lg">
                  Create Account
                </Link>
                <div>
                  <Link href="/portal/login" className="text-white/70 hover:text-white text-sm transition-colors">
                    Already registered? Sign in →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-gray-900 text-gray-400 py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-start justify-between gap-8 mb-8">
            <div>
              <Logo size={36} textColor="white" className="mb-3" />
              <p className="text-sm max-w-xs leading-relaxed">
                Delivering world-class eye care with compassion and precision.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-8 text-sm">
              <div>
                <p className="text-white font-semibold mb-3">Quick Links</p>
                {NAV_LINKS.map(l => (
                  <button key={l.href} onClick={() => scrollTo(l.href)}
                    className="block hover:text-white transition-colors mb-1.5">{l.label}</button>
                ))}
              </div>
              <div>
                <p className="text-white font-semibold mb-3">Portals</p>
                <Link href="/portal/login"    className="block hover:text-white mb-1.5">Patient Login</Link>
                <Link href="/portal/register" className="block hover:text-white mb-1.5">Register</Link>
                <Link href="/staff/login"     className="block hover:text-white mb-1.5">Staff Login</Link>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-6 text-center text-xs">
            © {new Date().getFullYear()} Anya Specialist Eye Clinic · SmartVision Platform
          </div>
        </div>
      </footer>

      {/* ── Zinny floating chat button ── */}
      <button onClick={() => setChatOpen(!chatOpen)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 brand-gradient rounded-full flex items-center justify-center shadow-2xl shadow-brand-700/40 hover:scale-110 transition-transform"
        title="Chat with Zinny">
        {chatOpen ? <X className="h-6 w-6 text-white" /> : <MessageCircle className="h-6 w-6 text-white" />}
      </button>

      {/* ── Zinny chat window ── */}
      {chatOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-80 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col" style={{ maxHeight: "420px" }}>
          <div className="brand-gradient p-4 flex items-center gap-3 flex-shrink-0">
            <div className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center">
              <Bot className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-white font-bold text-sm">Zinny</p>
              <p className="text-white/60 text-xs">AI Assistant · Online</p>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {chatMsgs.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[85%] rounded-xl px-3 py-2 text-xs leading-relaxed ${
                  m.role === "user" ? "brand-gradient text-white" : "bg-gray-100 text-gray-800"
                }`}>
                  {m.text}
                </div>
              </div>
            ))}
            {chatLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 rounded-xl px-3 py-2 flex items-center gap-1.5">
                  <Loader2 className="h-3 w-3 animate-spin text-brand" />
                  <span className="text-xs text-gray-500">Zinny is typing…</span>
                </div>
              </div>
            )}
          </div>
          <div className="p-3 border-t border-gray-100 flex gap-2 flex-shrink-0">
            <input value={chatInput} onChange={e => setChatInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && sendChat()}
              placeholder="Ask Zinny…"
              className="flex-1 text-xs border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:border-brand" />
            <button onClick={sendChat} disabled={!chatInput.trim() || chatLoading}
              className="brand-gradient text-white rounded-xl px-3 disabled:opacity-50">
              <Send className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
