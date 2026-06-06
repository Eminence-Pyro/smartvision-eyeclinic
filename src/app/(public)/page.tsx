"use client";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useCallback } from "react";
import {
  ChevronRight, ArrowRight, Star, Shield, Heart, Award,
  Activity, Users, MessageCircle, Send, Bot, Loader2,
  ChevronLeft, Quote, Play, CheckCircle
} from "lucide-react";
import Navbar from "@/components/ui/Navbar";
import Footer from "@/components/ui/Footer";
import Logo from "@/components/ui/Logo";

/* ── Hero slides — slit lamp + theatre backgrounds via Unsplash ── */
const SLIDES = [
  {
    bg: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1800&q=80",
    tag: "Advanced Eye Care",
    title: "See the World",
    titleAccent: "Crystal Clear.",
    sub: "Anya Specialist Eye Clinic combines cutting-edge technology with compassionate care — from routine exams to complex surgeries.",
    cta: "Book Consultation",
    ctaHref: "/contact",
  },
  {
    bg: "https://images.unsplash.com/photo-1551190822-a9333d879b1f?w=1800&q=80",
    tag: "State-of-the-Art Theatre",
    title: "Precision Surgery,",
    titleAccent: "Lasting Results.",
    sub: "Our fully equipped surgical theatre handles phacoemulsification, glaucoma surgery, vitrectomy, and more — with excellence every time.",
    cta: "Our Services",
    ctaHref: "/services",
  },
  {
    bg: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=1800&q=80",
    tag: "Patient-Centred Care",
    title: "Your Vision is",
    titleAccent: "Our Priority.",
    sub: "From the moment you walk in, every step of your journey is managed through our SmartVision digital platform — efficient, safe, and personal.",
    cta: "Create Account",
    ctaHref: "/portal/register",
  },
];

const SERVICES = [
  { icon: "👁️", title: "Comprehensive Eye Exam",  desc: "Complete vision and eye health screening by our specialist team." },
  { icon: "🔬", title: "Cataract Surgery",         desc: "State-of-the-art phacoemulsification with premium IOL options." },
  { icon: "💧", title: "Glaucoma Management",      desc: "Medical and surgical treatment to protect your optic nerve." },
  { icon: "📷", title: "OCT Imaging",              desc: "High-resolution retinal scans for early disease detection." },
  { icon: "🎯", title: "Fundus Photography",       desc: "Detailed retinal documentation for diabetic eye and AMD." },
  { icon: "📏", title: "Biometry & Pachymetry",    desc: "Precise measurements for surgical planning." },
  { icon: "🌐", title: "Cornea & Refractive",      desc: "LASIK assessment, pterygia, corneal conditions." },
  { icon: "🏥", title: "Community Outreach",       desc: "Free eye camps and telemedicine reaching underserved areas." },
];

const STATS = [
  { value:"5,000+", label:"Patients Served",    icon:"👥" },
  { value:"500+",   label:"Surgeries Done",      icon:"🏥" },
  { value:"15+",    label:"Years Experience",    icon:"⭐" },
  { value:"98%",    label:"Satisfaction Rate",   icon:"💜" },
];

const TESTIMONIALS = [
  {
    name: "Mrs. Adaeze Okafor",
    role: "Cataract Surgery Patient",
    text: "I had been struggling to see for two years. After my phaco surgery at Anya Eye Clinic, I could see clearly the very next morning. The staff were incredibly kind and professional throughout.",
    rating: 5,
    avatar: "AO",
  },
  {
    name: "Mr. Emeka Nwosu",
    role: "Glaucoma Patient",
    text: "I've been coming here for my glaucoma follow-ups for three years. The digital system is a game-changer — my records are always ready, my IOP history is right there for the doctor to see.",
    rating: 5,
    avatar: "EN",
  },
  {
    name: "Dr. Ngozi Eze",
    role: "Diabetic Retinopathy Patient",
    text: "The online patient portal is amazing. I can book appointments, see my scan results, and chat with the AI assistant all from my phone. Absolutely world-class service for Nigeria.",
    rating: 5,
    avatar: "NE",
  },
  {
    name: "Chief Bola Adeyemi",
    role: "Family of Surgery Patient",
    text: "My mother had eye surgery here. The transparency was what impressed me most — we knew exactly what stage of treatment she was at, from the tally number to the theatre. Highly recommend.",
    rating: 5,
    avatar: "BA",
  },
];

const WHY_US = [
  { icon: Shield,   title: "Experienced Specialists",  desc: "Led by a Consultant Ophthalmologist with 15+ years of specialist practice." },
  { icon: Activity, title: "Digital-First Clinic",     desc: "SmartVision platform manages every step — no lost records, no long waits." },
  { icon: Award,    title: "Modern Equipment",         desc: "OCT, slit lamp, pachymeter, B-scan and full surgical theatre." },
  { icon: Heart,    title: "Compassionate Care",       desc: "Every patient treated with warmth, dignity, and clinical excellence." },
];

type ChatMsg = { role: "user" | "ai"; text: string };

export default function HomePage() {
  const [slide, setSlide]       = useState(0);
  const [animating, setAnimating] = useState(false);
  const [testimonial, setTestimonial] = useState(0);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMsgs, setChatMsgs] = useState<ChatMsg[]>([
    { role: "ai", text: "Hi! I'm Zinny 👋 — your Anya Eye Clinic assistant. How can I help you today?" }
  ]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setLoading] = useState(false);

  const nextSlide = useCallback(() => {
    if (animating) return;
    setAnimating(true);
    setTimeout(() => { setSlide(s => (s + 1) % SLIDES.length); setAnimating(false); }, 300);
  }, [animating]);

  const prevSlide = useCallback(() => {
    if (animating) return;
    setAnimating(true);
    setTimeout(() => { setSlide(s => (s - 1 + SLIDES.length) % SLIDES.length); setAnimating(false); }, 300);
  }, [animating]);

  /* Auto-advance hero */
  useEffect(() => {
    const t = setInterval(nextSlide, 6000);
    return () => clearInterval(t);
  }, [nextSlide]);

  /* Auto-advance testimonials */
  useEffect(() => {
    const t = setInterval(() => setTestimonial(t => (t + 1) % TESTIMONIALS.length), 5000);
    return () => clearInterval(t);
  }, []);

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
      setChatMsgs(p => [...p, { role: "ai", text: data.reply || "Sorry, try again." }]);
    } catch {
      setChatMsgs(p => [...p, { role: "ai", text: "Connection issue — please try again." }]);
    }
    setLoading(false);
  };

  const s = SLIDES[slide];

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <Navbar />

      {/* ── HERO CAROUSEL ── */}
      <section className="relative h-screen min-h-[600px] overflow-hidden">
        {/* Background image */}
        <div
          className={`absolute inset-0 transition-opacity duration-700 ${animating ? "opacity-0" : "opacity-100"}`}
          style={{ backgroundImage: `url(${s.bg})`, backgroundSize: "cover", backgroundPosition: "center" }}
        />
        {/* Dark overlay with purple tint */}
        <div className="absolute inset-0 bg-gradient-to-r from-gray-950/90 via-brand-900/70 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-950/60 to-transparent" />

        {/* Content */}
        <div className="relative z-10 h-full flex items-center">
          <div className="max-w-7xl mx-auto px-6 w-full">
            <div className="max-w-2xl">
              <div className={`transition-all duration-500 ${animating ? "opacity-0 translate-y-4" : "opacity-100 translate-y-0"}`}>
                <span className="inline-flex items-center gap-2 bg-brand/20 border border-brand-400/40 text-brand-300 text-xs font-bold px-4 py-1.5 rounded-full mb-5 backdrop-blur">
                  <Star className="h-3.5 w-3.5" /> {s.tag}
                </span>
                <h1 className="font-serif font-black text-5xl md:text-7xl text-white leading-tight mb-2">
                  {s.title}
                </h1>
                <h1 className="font-serif font-black text-5xl md:text-7xl leading-tight mb-6 brand-gradient-text">
                  {s.titleAccent}
                </h1>
                <p className="text-gray-300 text-lg leading-relaxed mb-8 max-w-xl">
                  {s.sub}
                </p>
                <div className="flex flex-wrap gap-4">
                  <Link href={s.ctaHref}
                    className="flex items-center gap-2 brand-gradient text-white rounded-full px-8 py-4 font-bold text-base shadow-2xl shadow-brand-700/40 hover:opacity-90 transition-all">
                    {s.cta} <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link href="/about"
                    className="flex items-center gap-2 bg-white/10 backdrop-blur border border-white/20 text-white rounded-full px-7 py-4 font-semibold hover:bg-white/20 transition-all">
                    <Play className="h-4 w-4" /> About Us
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Slide controls */}
        <button onClick={prevSlide}
          className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-white/10 backdrop-blur border border-white/20 text-white rounded-full flex items-center justify-center hover:bg-brand transition-all">
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button onClick={nextSlide}
          className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-white/10 backdrop-blur border border-white/20 text-white rounded-full flex items-center justify-center hover:bg-brand transition-all">
          <ChevronRight className="h-5 w-5" />
        </button>

        {/* Dots */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-2">
          {SLIDES.map((_, i) => (
            <button key={i} onClick={() => setSlide(i)}
              className={`rounded-full transition-all duration-300 ${i === slide ? "w-8 h-2.5 bg-brand-400" : "w-2.5 h-2.5 bg-white/40 hover:bg-white/70"}`} />
          ))}
        </div>

        {/* Scroll hint */}
        <div className="absolute bottom-8 right-8 z-20 hidden md:flex flex-col items-center gap-2 text-white/40 text-xs">
          <span className="writing-mode-vertical rotate-90 tracking-widest uppercase">Scroll</span>
          <div className="w-px h-10 bg-white/20" />
        </div>
      </section>

      {/* ── STATS BAR ── */}
      <section className="brand-gradient py-10">
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          {STATS.map(s => (
            <div key={s.label} className="py-2">
              <div className="text-2xl mb-1">{s.icon}</div>
              <p className="text-3xl font-black text-white mb-0.5">{s.value}</p>
              <p className="text-white/60 text-xs font-medium uppercase tracking-widest">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── SERVICES PREVIEW ── */}
      <section className="py-24 bg-gray-50 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-brand text-xs font-bold uppercase tracking-widest mb-3">What We Offer</p>
            <h2 className="font-serif font-black text-4xl md:text-5xl text-gray-900 mb-4">
              Comprehensive Eye Care<br /><span className="brand-gradient-text">Under One Roof</span>
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              From simple eye tests to complex surgical procedures, we cover every aspect of ocular health.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {SERVICES.map((svc, i) => (
              <div key={svc.title}
                className="bg-white rounded-2xl p-6 border border-gray-100 card-hover group hover:border-brand-200 hover:shadow-lg hover:shadow-brand-100 transition-all">
                <div className="text-3xl mb-4">{svc.icon}</div>
                <h3 className="font-bold text-gray-900 mb-2 group-hover:text-brand transition-colors">{svc.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed mb-4">{svc.desc}</p>
                <div className="flex items-center text-brand text-xs font-semibold opacity-0 group-hover:opacity-100 transition-all">
                  Learn more <ChevronRight className="h-3.5 w-3.5 ml-1" />
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link href="/services"
              className="inline-flex items-center gap-2 brand-gradient text-white rounded-full px-8 py-3.5 font-bold shadow-lg hover:opacity-90 transition-all">
              View All Services <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── ABOUT TEASER ── */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Image collage */}
          <div className="relative">
            <div className="rounded-3xl overflow-hidden shadow-2xl shadow-brand-700/15 aspect-[4/3]"
              style={{ backgroundImage:"url(https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=900&q=80)", backgroundSize:"cover", backgroundPosition:"center" }} />
            {/* Floating badge */}
            <div className="absolute -bottom-5 -right-5 bg-white rounded-2xl shadow-xl p-5 border border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 brand-gradient rounded-xl flex items-center justify-center shadow">
                  <Logo size={28} showText={false} />
                </div>
                <div>
                  <p className="font-black text-gray-900 text-xl">15+</p>
                  <p className="text-gray-500 text-xs">Years of Excellence</p>
                </div>
              </div>
            </div>
            <div className="absolute -top-5 -left-5 bg-brand-600 rounded-2xl shadow-xl p-4 text-white">
              <p className="text-xs font-bold uppercase tracking-widest mb-0.5">Surgeries</p>
              <p className="text-2xl font-black">500+</p>
              <p className="text-brand-200 text-xs">Successful procedures</p>
            </div>
          </div>

          <div>
            <p className="text-brand text-xs font-bold uppercase tracking-widest mb-3">About the Clinic</p>
            <h2 className="font-serif font-black text-4xl text-gray-900 mb-5 leading-tight">
              Where Modern Technology Meets <span className="brand-gradient-text">Human Care</span>
            </h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              Anya Specialist Eye Clinic is led by our Consultant Ophthalmologist with over 15 years of specialist practice.
              We combine the most advanced diagnostic equipment with a deeply personal approach to every patient.
            </p>
            <p className="text-gray-600 leading-relaxed mb-7">
              Our SmartVision digital platform means no paper records, no lost results, and no confusion — just seamless, efficient care from registration to discharge.
            </p>
            <div className="grid grid-cols-2 gap-3 mb-7">
              {WHY_US.map(({ icon: Icon, title, desc }) => (
                <div key={title} className="flex items-start gap-3 p-4 bg-brand-50 rounded-xl border border-brand-100">
                  <Icon className="h-5 w-5 text-brand flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{title}</p>
                    <p className="text-gray-500 text-xs leading-relaxed mt-0.5">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <Link href="/about"
              className="inline-flex items-center gap-2 text-brand font-bold hover:gap-3 transition-all">
              Learn more about us <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="py-24 bg-gray-950 px-6 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5 brand-gradient" />
        <div className="max-w-5xl mx-auto relative z-10">
          <div className="text-center mb-14">
            <p className="text-brand-400 text-xs font-bold uppercase tracking-widest mb-3">Patient Stories</p>
            <h2 className="font-serif font-black text-4xl text-white">
              What Our Patients Say
            </h2>
          </div>

          {/* Main testimonial */}
          <div className="relative">
            <div className="bg-white/5 backdrop-blur border border-white/10 rounded-3xl p-8 md:p-12 text-center mb-6">
              <Quote className="h-10 w-10 text-brand-400 mx-auto mb-6 opacity-60" />
              <p className="text-white text-lg md:text-xl leading-relaxed font-light mb-8 max-w-3xl mx-auto italic">
                &ldquo;{TESTIMONIALS[testimonial].text}&rdquo;
              </p>
              <div className="flex items-center justify-center gap-1 mb-4">
                {[...Array(TESTIMONIALS[testimonial].rating)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <div className="flex items-center justify-center gap-3">
                <div className="w-12 h-12 brand-gradient rounded-full flex items-center justify-center text-white font-bold text-sm">
                  {TESTIMONIALS[testimonial].avatar}
                </div>
                <div className="text-left">
                  <p className="text-white font-bold">{TESTIMONIALS[testimonial].name}</p>
                  <p className="text-gray-400 text-sm">{TESTIMONIALS[testimonial].role}</p>
                </div>
              </div>
            </div>

            {/* Testimonial dots */}
            <div className="flex justify-center gap-2">
              {TESTIMONIALS.map((_, i) => (
                <button key={i} onClick={() => setTestimonial(i)}
                  className={`rounded-full transition-all duration-300 ${i === testimonial ? "w-8 h-2 bg-brand-400" : "w-2 h-2 bg-white/20 hover:bg-white/40"}`} />
              ))}
            </div>
          </div>

          {/* Mini cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-10">
            {TESTIMONIALS.map((t, i) => (
              <button key={i} onClick={() => setTestimonial(i)}
                className={`p-4 rounded-xl border text-left transition-all ${i === testimonial ? "bg-brand/20 border-brand-500" : "bg-white/5 border-white/10 hover:border-white/20"}`}>
                <div className="flex items-center gap-2 mb-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold ${i === testimonial ? "brand-gradient" : "bg-white/20"}`}>
                    {t.avatar}
                  </div>
                  <div className="min-w-0">
                    <p className="text-white text-xs font-semibold truncate">{t.name.split(" ")[0]} {t.name.split(" ")[1]?.[0]}.</p>
                    <p className="text-gray-500 text-[10px] truncate">{t.role}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── BLOG PREVIEW ── */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-end justify-between mb-12">
            <div>
              <p className="text-brand text-xs font-bold uppercase tracking-widest mb-2">Eye Health Tips</p>
              <h2 className="font-serif font-black text-4xl text-gray-900">Latest from our Blog</h2>
            </div>
            <Link href="/blog" className="hidden md:flex items-center gap-2 text-brand font-semibold hover:gap-3 transition-all">
              All Posts <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                img: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&q=80",
                cat: "Cataract",
                title: "What to Expect from Phacoemulsification Surgery",
                excerpt: "Modern cataract surgery is one of the safest procedures in medicine. Here's a step-by-step guide to what happens on the day.",
                date: "June 2, 2026",
                read: "5 min read",
              },
              {
                img: "https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=600&q=80",
                cat: "Glaucoma",
                title: "The Silent Thief: Understanding Glaucoma",
                excerpt: "Glaucoma is called the silent thief of sight because it causes no pain and you may not notice vision loss until it's advanced.",
                date: "May 28, 2026",
                read: "4 min read",
              },
              {
                img: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=600&q=80",
                cat: "Eye Health",
                title: "5 Signs You Need to See an Eye Doctor Today",
                excerpt: "Many serious eye conditions can be treated effectively if caught early. Don't ignore these warning signs.",
                date: "May 20, 2026",
                read: "3 min read",
              },
            ].map((post, i) => (
              <Link key={i} href="/blog"
                className="group bg-white rounded-2xl border border-gray-100 overflow-hidden card-hover hover:shadow-xl hover:shadow-gray-100">
                <div className="aspect-video overflow-hidden">
                  <img src={post.img} alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
                <div className="p-5">
                  <span className="text-xs font-bold text-brand bg-brand-50 px-3 py-1 rounded-full">{post.cat}</span>
                  <h3 className="font-bold text-gray-900 mt-3 mb-2 leading-snug group-hover:text-brand transition-colors">{post.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed line-clamp-2">{post.excerpt}</p>
                  <div className="flex items-center justify-between mt-4 text-xs text-gray-400">
                    <span>{post.date}</span>
                    <span>{post.read}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section className="py-20 px-6 relative overflow-hidden"
        style={{ backgroundImage:"url(https://images.unsplash.com/photo-1551190822-a9333d879b1f?w=1800&q=80)", backgroundSize:"cover", backgroundPosition:"center" }}>
        <div className="absolute inset-0 bg-gradient-to-r from-brand-900/95 to-accent-900/90" />
        <div className="max-w-3xl mx-auto text-center relative z-10">
          <h2 className="font-serif font-black text-4xl md:text-5xl text-white mb-5">
            Ready to See Clearly?
          </h2>
          <p className="text-white/70 text-lg mb-8">
            Book your consultation today. Our team is ready to help.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/contact"
              className="bg-white text-brand font-bold rounded-full px-9 py-4 hover:bg-gray-50 transition-all shadow-xl">
              Book Now
            </Link>
            <Link href="/portal/register"
              className="border-2 border-white text-white rounded-full px-9 py-4 font-semibold hover:bg-white/10 transition-all">
              Create Patient Account
            </Link>
          </div>
        </div>
      </section>

      <Footer />

      {/* ── Zinny floating chat ── */}
      <button onClick={() => setChatOpen(!chatOpen)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 brand-gradient rounded-full flex items-center justify-center shadow-2xl shadow-brand-700/40 hover:scale-110 transition-transform"
        title="Chat with Zinny">
        {chatOpen ? <span className="text-white text-lg font-bold">×</span> : <MessageCircle className="h-6 w-6 text-white" />}
      </button>

      {chatOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-80 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col" style={{ maxHeight:"420px" }}>
          <div className="brand-gradient p-4 flex items-center gap-3 flex-shrink-0">
            <div className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center">
              <Bot className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-white font-bold text-sm">Zinny</p>
              <div className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-green-300" /><p className="text-white/60 text-xs">AI Assistant · Online</p></div>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-gray-50">
            {chatMsgs.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[85%] rounded-xl px-3 py-2 text-xs leading-relaxed ${m.role === "user" ? "brand-gradient text-white" : "bg-white border border-gray-100 text-gray-800 shadow-sm"}`}>
                  {m.text}
                </div>
              </div>
            ))}
            {chatLoading && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-100 rounded-xl px-3 py-2 flex items-center gap-1.5 shadow-sm">
                  <Loader2 className="h-3 w-3 animate-spin text-brand" />
                  <span className="text-xs text-gray-400">Zinny is typing…</span>
                </div>
              </div>
            )}
          </div>
          <div className="p-3 border-t border-gray-100 flex gap-2 bg-white flex-shrink-0">
            <input value={chatInput} onChange={e => setChatInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && sendChat()}
              placeholder="Ask Zinny about our services…"
              className="flex-1 text-xs border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:border-brand" />
            <button onClick={sendChat} disabled={!chatInput.trim() || chatLoading}
              className="brand-gradient text-white rounded-xl px-3 py-2 disabled:opacity-50">
              <Send className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
