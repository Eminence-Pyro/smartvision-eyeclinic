"use client";
import Navbar from "@/components/ui/Navbar";
import Footer from "@/components/ui/Footer";
import { CheckCircle, Award, Users, Heart, Shield } from "lucide-react";

const TEAM = [
  { name:"Dr. Anya Kalu", title:"Consultant Ophthalmologist · CMD/CEO", desc:"15+ years of specialist experience. Expertise in cataract surgery, glaucoma management, and medical retina.", initials:"DA" },
  { name:"Senior Optometrist", title:"Chief Optometrist", desc:"Comprehensive eye examinations, contact lens fitting, and visual fields.", initials:"SO" },
  { name:"Theatre Nurse", title:"Senior Scrub Nurse", desc:"Specialised surgical theatre support and pre/post-operative patient care.", initials:"TN" },
];

const VALUES = [
  { icon:Heart,   title:"Compassion",   desc:"Every patient is treated with warmth, respect, and dignity — always." },
  { icon:Shield,  title:"Safety",       desc:"Rigorous clinical protocols and a digital audit trail for every patient." },
  { icon:Award,   title:"Excellence",   desc:"We hold ourselves to the highest clinical and service standards." },
  { icon:Users,   title:"Community",    desc:"Free outreach camps, student eye health programmes, and telemedicine." },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      {/* Page hero */}
      <div className="relative pt-24 pb-20 overflow-hidden bg-[url('https://images.unsplash.com/photo-1551190822-a9333d879b1f?w=1800&q=80')] bg-cover bg-center">
        <div className="absolute inset-0 bg-gradient-to-r from-brand-900/95 to-brand-800/80" />
        <div className="relative z-10 max-w-7xl mx-auto px-6 py-16">
          <p className="text-brand-300 text-xs font-bold uppercase tracking-widest mb-3">About Us</p>
          <h1 className="font-serif font-black text-5xl text-white mb-4">Our Story &amp; Mission</h1>
          <p className="text-white/70 max-w-xl text-lg">Dedicated to delivering world-class eye care to every patient, with the technology and compassion they deserve.</p>
        </div>
      </div>

      {/* Story */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <p className="text-brand text-xs font-bold uppercase tracking-widest mb-3">Who We Are</p>
            <h2 className="font-serif font-black text-4xl text-gray-900 mb-5">Anya Specialist Eye Clinic</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              Founded with a clear mission — to make specialist ophthalmology care accessible to every Nigerian — Anya Specialist Eye Clinic has grown into one of the most trusted eye care centres in the region.
            </p>
            <p className="text-gray-600 leading-relaxed mb-4">
              Led by our Consultant Ophthalmologist and CMD, our team handles everything from basic refractions to complex surgical procedures. We invest in the latest equipment and in continuous training so our patients always receive internationally benchmarked care.
            </p>
            <p className="text-gray-600 leading-relaxed mb-7">
              In 2026, we launched SmartVision — our fully digital clinic management platform — eliminating paper records, streamlining patient flow, and giving every patient access to their own health records online.
            </p>
            <div className="space-y-2.5">
              {[
                "Fully digital patient records — zero paper",
                "Real-time patient flow tracking across all departments",
                "Online appointment booking and telemedicine",
                "AI-powered Zinny chatbot — 24/7 patient support",
              ].map(item => (
                <div key={item} className="flex items-start gap-2.5 text-sm text-gray-700">
                  <CheckCircle className="h-5 w-5 text-brand flex-shrink-0 mt-0.5" />
                  {item}
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-3xl overflow-hidden shadow-2xl aspect-square bg-[url('https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=900&q=80')] bg-cover bg-center" />
        </div>
      </section>

      {/* Values */}
      <section className="py-20 bg-gray-50 px-6">
        <div className="max-w-5xl mx-auto text-center mb-12">
          <p className="text-brand text-xs font-bold uppercase tracking-widest mb-3">What Drives Us</p>
          <h2 className="font-serif font-black text-4xl text-gray-900">Our Core Values</h2>
        </div>
        <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {VALUES.map(({ icon:Icon, title, desc }) => (
            <div key={title} className="bg-white rounded-2xl p-6 border border-gray-100 text-center card-hover">
              <div className="w-14 h-14 brand-gradient rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-brand-700/20">
                <Icon className="h-7 w-7 text-white" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">{title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Team */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-brand text-xs font-bold uppercase tracking-widest mb-3">The People Behind Your Care</p>
            <h2 className="font-serif font-black text-4xl text-gray-900">Our Team</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TEAM.map(member => (
              <div key={member.name} className="bg-white rounded-2xl border border-gray-100 overflow-hidden card-hover">
                <div className="h-52 brand-gradient flex items-center justify-center relative">
                  <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center">
                    <span className="text-white font-black text-2xl">{member.initials}</span>
                  </div>
                  <p className="absolute bottom-3 text-white/40 text-xs">[Photo placeholder]</p>
                </div>
                <div className="p-5">
                  <h3 className="font-bold text-gray-900">{member.name}</h3>
                  <p className="text-brand text-xs font-semibold mb-2">{member.title}</p>
                  <p className="text-gray-500 text-sm leading-relaxed">{member.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
