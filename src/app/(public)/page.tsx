"use client";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import {
  Eye, Phone, MapPin, Mail, Clock, ChevronRight,
  Star, Shield, Heart, Activity, Users, Award,
  MessageCircle, Calendar, ArrowRight, Menu, X
} from "lucide-react";

const NAV_LINKS = [
  { label: "Home",       href: "#home"     },
  { label: "About",      href: "#about"    },
  { label: "Services",   href: "#services" },
  { label: "Team",       href: "#team"     },
  { label: "Contact",    href: "#contact"  },
];

const SERVICES = [
  { icon: "👁️", title: "Comprehensive Eye Exam",   desc: "Detailed assessment of your vision and eye health by our specialist team." },
  { icon: "🔬", title: "Phacoemulsification",       desc: "State-of-the-art cataract surgery with rapid recovery and excellent outcomes." },
  { icon: "💧", title: "Glaucoma Surgery",          desc: "Trabeculectomy and other glaucoma procedures to preserve your sight." },
  { icon: "📷", title: "OCT Scanning",              desc: "High-resolution optical coherence tomography for retinal and disc imaging." },
  { icon: "🎯", title: "Gonioscopy",                desc: "Precision assessment of the drainage angle for glaucoma management." },
  { icon: "📏", title: "Pachymetry",                desc: "Corneal thickness measurement — essential for glaucoma and LASIK assessment." },
  { icon: "🌐", title: "Fundus Photography",        desc: "Detailed retinal imaging for diabetic eye disease, AMD, and more." },
  { icon: "🏥", title: "Community Outreach",        desc: "Free eye care camps and telemedicine services for underserved communities." },
];

const STATS = [
  { value: "5000+", label: "Patients Served"   },
  { value: "500+",  label: "Surgeries Performed" },
  { value: "15+",   label: "Years Experience"   },
  { value: "98%",   label: "Patient Satisfaction"},
];

export default function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);

  const scrollTo = (href: string) => {
    setMenuOpen(false);
    document.querySelector(href)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-white text-gray-900">

      {/* ── Navbar ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full brand-gradient flex items-center justify-center shadow">
              <Eye className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="font-bold text-brand text-sm leading-none">Anya Specialist</p>
              <p className="text-gray-500 text-[10px] tracking-wider">EYE CLINIC</p>
            </div>
          </div>

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
              className="brand-gradient text-white rounded-full px-5 py-2 text-sm font-bold shadow hover:opacity-90 transition-all">
              Book Appointment
            </button>
            <button className="md:hidden" onClick={() => setMenuOpen(!menuOpen)}>
              {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
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
        <div className="absolute inset-0 brand-gradient opacity-[0.03] pointer-events-none" />
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 bg-brand-50 border border-brand-200 text-brand text-xs font-bold px-4 py-1.5 rounded-full mb-6">
              <Star className="h-3.5 w-3.5" /> Specialist Eye Care in Nigeria
            </div>
            <h1 className="font-serif font-black text-5xl md:text-6xl text-gray-900 leading-tight mb-6">
              Your Vision is Our<br />
              <span className="text-brand">Priority.</span>
            </h1>
            <p className="text-gray-500 text-lg leading-relaxed mb-8 max-w-lg">
              Anya Specialist Eye Clinic delivers world-class ophthalmology care — from routine consultations
              to complex surgeries — with compassion and precision.
            </p>
            <div className="flex flex-wrap gap-4">
              <button onClick={() => scrollTo("#contact")}
                className="flex items-center gap-2 brand-gradient text-white rounded-full px-7 py-3.5 font-bold shadow-lg shadow-brand/25 hover:opacity-90 transition-all">
                Book Appointment <ArrowRight className="h-4 w-4" />
              </button>
              <button onClick={() => scrollTo("#services")}
                className="flex items-center gap-2 border border-brand text-brand rounded-full px-7 py-3.5 font-semibold hover:bg-brand-50 transition-all">
                Our Services <ChevronRight className="h-4 w-4" />
              </button>
            </div>
            <div className="flex flex-wrap gap-6 mt-10">
              {[
                { icon: Shield, text: "Experienced Specialists" },
                { icon: Heart,  text: "Patient-Centred Care"   },
                { icon: Award,  text: "Modern Equipment"        },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-2 text-gray-600 text-sm">
                  <Icon className="h-4 w-4 text-brand" /> {text}
                </div>
              ))}
            </div>
          </div>

          {/* Hero image placeholder */}
          <div className="relative">
            <div className="w-full aspect-[4/3] rounded-3xl brand-gradient flex items-center justify-center shadow-2xl shadow-brand/20">
              <div className="text-center text-white">
                <Eye className="h-20 w-20 mx-auto mb-4 opacity-60" />
                <p className="text-lg font-semibold opacity-80">Anya Specialist Eye Clinic</p>
                <p className="text-sm opacity-60">Place clinic photo here</p>
              </div>
            </div>
            {/* Floating cards */}
            <div className="absolute -bottom-6 -left-6 bg-white rounded-2xl shadow-xl p-4 flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                <Activity className="h-5 w-5 text-green-600" />
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
                <p className="font-bold text-gray-900 text-sm">5000+ Patients</p>
                <p className="text-gray-500 text-xs">Trust our care</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="py-12 bg-brand-500">
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {STATS.map(s => (
            <div key={s.label}>
              <p className="text-3xl font-black text-white mb-1">{s.value}</p>
              <p className="text-brand-200 text-sm">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── About ── */}
      <section id="about" className="py-24 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="w-full aspect-square max-w-md mx-auto rounded-3xl bg-brand-50 border border-brand-100 flex items-center justify-center">
            <div className="text-center p-8">
              <div className="w-24 h-24 brand-gradient rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-serif font-black text-3xl">A</span>
              </div>
              <p className="text-brand font-bold text-lg">Dr. Anya</p>
              <p className="text-gray-500 text-sm">CMD / Consultant Ophthalmologist</p>
              <p className="text-gray-400 text-xs mt-2">Place photo here</p>
            </div>
          </div>
          <div>
            <div className="flex items-center gap-3 mb-4">
              <span className="text-brand text-xs font-bold tracking-widest uppercase">About the Clinic</span>
              <div className="h-px flex-1 bg-brand-100" />
            </div>
            <h2 className="font-serif font-black text-4xl text-gray-900 mb-4 leading-tight">
              Expert Eye Care, <span className="text-brand">Decades of Trust</span>
            </h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              Anya Specialist Eye Clinic is a leading ophthalmology centre dedicated to providing
              comprehensive, compassionate eye care. Led by Dr. Anya, our consultant ophthalmologist
              and Medical Director with over 15 years of specialist experience, we combine modern
              technology with personalised attention.
            </p>
            <p className="text-gray-600 leading-relaxed mb-6">
              From simple refractions to complex surgeries like phacoemulsification and glaucoma
              procedures, we are equipped to handle all aspects of eye health. Our community outreach
              programme extends our services to underserved populations across the region.
            </p>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: "Consultations", value: "Mon–Sat, 8am–5pm" },
                { label: "Emergencies",   value: "24/7 On-Call"     },
                { label: "Surgery Days",  value: "Tue & Thu"        },
                { label: "Outreach",      value: "Monthly"          },
              ].map(item => (
                <div key={item.label} className="bg-brand-50 rounded-xl p-3">
                  <p className="text-brand text-xs font-bold uppercase tracking-wide">{item.label}</p>
                  <p className="text-gray-700 text-sm font-medium mt-0.5">{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Services ── */}
      <section id="services" className="py-24 bg-gray-50 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-brand text-sm font-bold uppercase tracking-widest mb-3">Our Services</p>
            <h2 className="font-serif font-black text-4xl text-gray-900">
              Comprehensive Eye Care <span className="text-brand">Under One Roof</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {SERVICES.map(svc => (
              <div key={svc.title}
                className="bg-white rounded-2xl p-6 border border-gray-100 card-hover">
                <div className="text-3xl mb-4">{svc.icon}</div>
                <h3 className="font-bold text-gray-900 mb-2">{svc.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{svc.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Contact / Booking ── */}
      <section id="contact" className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-brand text-sm font-bold uppercase tracking-widest mb-3">Contact & Booking</p>
            <h2 className="font-serif font-black text-4xl text-gray-900">
              Ready to <span className="text-brand">Book an Appointment?</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {/* Contact info */}
            <div className="space-y-5">
              {[
                { icon: Phone,  label: "Phone",    value: "+234 XXX XXX XXXX",           href: "tel:+234" },
                { icon: Mail,   label: "Email",    value: "info@anyaeyeclinic.com",       href: "mailto:info@anyaeyeclinic.com" },
                { icon: MapPin, label: "Address",  value: "Anya Specialist Eye Clinic, [Address], Nigeria", href: "#" },
                { icon: Clock,  label: "Hours",    value: "Mon–Sat: 8am–5pm | Emergencies: 24/7", href: "#" },
              ].map(({ icon: Icon, label, value, href }) => (
                <div key={label} className="flex items-start gap-4 p-4 bg-brand-50 rounded-xl">
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
            {/* Booking CTA */}
            <div className="bg-brand-500 rounded-3xl p-8 text-white text-center flex flex-col justify-center">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-80" />
              <h3 className="font-serif font-black text-2xl mb-3">Book Online</h3>
              <p className="text-brand-100 mb-6 leading-relaxed">
                Create a patient account to book appointments online, pay consultation fees, and access your health records anytime.
              </p>
              <Link href="/portal/register"
                className="bg-white text-brand font-bold rounded-full px-8 py-3.5 hover:bg-brand-50 transition-all inline-block mb-3">
                Create Account
              </Link>
              <Link href="/portal/login"
                className="text-brand-200 hover:text-white text-sm transition-colors">
                Already have an account? Sign in →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-gray-900 text-gray-400 py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-start justify-between gap-8 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 brand-gradient rounded-full flex items-center justify-center">
                  <Eye className="h-4 w-4 text-white" />
                </div>
                <span className="text-white font-bold">Anya Specialist Eye Clinic</span>
              </div>
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
                <p className="text-white font-semibold mb-3">Portal</p>
                <Link href="/portal/login"   className="block hover:text-white mb-1.5">Patient Login</Link>
                <Link href="/portal/register" className="block hover:text-white mb-1.5">Register</Link>
                <Link href="/staff/login"    className="block hover:text-white mb-1.5">Staff Login</Link>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-6 text-center text-xs">
            © {new Date().getFullYear()} Anya Specialist Eye Clinic. All rights reserved. | SmartVision Platform
          </div>
        </div>
      </footer>

      {/* ── Zinny Chatbot button ── */}
      <button
        onClick={() => setChatOpen(!chatOpen)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 brand-gradient rounded-full flex items-center justify-center shadow-xl hover:scale-110 transition-transform"
        title="Chat with Zinny"
      >
        {chatOpen ? <X className="h-6 w-6 text-white" /> : <MessageCircle className="h-6 w-6 text-white" />}
      </button>

      {/* ── Zinny Chat Window (placeholder) ── */}
      {chatOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-80 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
          <div className="brand-gradient p-4 flex items-center gap-3">
            <div className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center">
              <Eye className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-white font-bold text-sm">Zinny</p>
              <p className="text-brand-100 text-xs">AI Assistant · Online</p>
            </div>
          </div>
          <div className="p-4 h-64 flex items-center justify-center text-center">
            <div>
              <p className="text-2xl mb-2">👋</p>
              <p className="text-gray-700 font-semibold text-sm">Hi! I&apos;m Zinny</p>
              <p className="text-gray-500 text-xs mt-1 leading-relaxed">
                Your Anya Eye Clinic AI assistant. Ask me about our services, location, booking, and more!
              </p>
              <p className="text-brand-300 text-xs mt-3 italic">Full AI chat coming soon…</p>
            </div>
          </div>
          <div className="p-3 border-t border-gray-100 flex gap-2">
            <input placeholder="Ask Zinny…" className="flex-1 text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:border-brand" />
            <button className="brand-gradient text-white rounded-xl px-3 py-2 text-sm font-bold">Send</button>
          </div>
        </div>
      )}
    </div>
  );
}
