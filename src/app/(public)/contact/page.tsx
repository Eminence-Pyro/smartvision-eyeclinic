"use client";
import { useState } from "react";
import Navbar from "@/components/ui/Navbar";
import Footer from "@/components/ui/Footer";
import Link from "next/link";
import { Phone, Mail, MapPin, Clock, Send, CheckCircle, Calendar } from "lucide-react";

export default function ContactPage() {
  const [form, setForm]     = useState({ name:"", email:"", phone:"", service:"", message:"" });
  const [sent, setSent]     = useState(false);
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    // In production: POST to /api/contact
    await new Promise(r => setTimeout(r, 1200));
    setSent(true);
    setSending(false);
  };

  const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="relative pt-24 pb-20 bg-[url('https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1800&q=80')] bg-cover bg-center">
        <div className="absolute inset-0 bg-gradient-to-r from-brand-900/95 to-brand-800/80" />
        <div className="relative z-10 max-w-7xl mx-auto px-6 py-16">
          <p className="text-brand-300 text-xs font-bold uppercase tracking-widest mb-3">Get in Touch</p>
          <h1 className="font-serif font-black text-5xl text-white mb-4">Contact Us</h1>
          <p className="text-white/70 max-w-xl text-lg">Book an appointment, ask a question, or find our location. We&apos;re here to help.</p>
        </div>
      </div>

      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Info cards */}
          <div className="space-y-4">
            {[
              { icon:Phone,   label:"Phone",   value:"+234 XXX XXX XXXX", sub:"Call us anytime", href:"tel:+234" },
              { icon:Mail,    label:"Email",   value:"info@anyaeyeclinic.com", sub:"We reply within 24h", href:"mailto:info@anyaeyeclinic.com" },
              { icon:MapPin,  label:"Address", value:"No. 30 Ohafia Street Umuahia", sub:"Abia State Nigeria", href:"#" },
              { icon:Clock,   label:"Hours",   value:"Mon–Sat 8:00am–5:00pm", sub:"Emergencies: 24/7", href:"#" },
            ].map(({ icon:Icon, label, value, sub, href }) => (
              <a key={label} href={href}
                className="flex items-start gap-4 p-5 bg-white rounded-2xl border border-gray-100 shadow-sm hover:border-brand-200 hover:shadow-md transition-all group">
                <div className="w-11 h-11 brand-gradient rounded-xl flex items-center justify-center flex-shrink-0 shadow group-hover:scale-110 transition-transform">
                  <Icon className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-brand text-xs font-bold uppercase tracking-wide">{label}</p>
                  <p className="text-gray-900 font-semibold text-sm mt-0.5">{value}</p>
                  <p className="text-gray-400 text-xs">{sub}</p>
                </div>
              </a>
            ))}

            {/* Quick links */}
            <div className="brand-gradient rounded-2xl p-6 text-white">
              <Calendar className="h-8 w-8 mb-3 opacity-80" />
              <h3 className="font-bold text-lg mb-2">Book Online</h3>
              <p className="text-white/70 text-sm mb-4">Create a patient account to book appointments and access your records anytime.</p>
              <Link href="/portal/register"
                className="block text-center bg-white text-brand font-bold rounded-xl py-3 text-sm hover:bg-gray-50 transition-all">
                Create Account
              </Link>
            </div>
          </div>

          {/* Contact form */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
            {sent ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12">
                <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
                <h3 className="font-bold text-2xl text-gray-900 mb-2">Message Sent!</h3>
                <p className="text-gray-500 max-w-sm">Thank you for reaching out. Our team will get back to you within 24 hours.</p>
                <button onClick={() => setSent(false)} className="mt-6 text-brand font-semibold hover:underline">Send another message</button>
              </div>
            ) : (
              <>
                <h2 className="font-bold text-2xl text-gray-900 mb-1">Send us a Message</h2>
                <p className="text-gray-500 text-sm mb-6">Fill in the form below and we&apos;ll respond promptly.</p>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="name" className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Full Name *</label>
                      <input id="name" value={form.name} onChange={e => set("name", e.target.value)} required
                        placeholder="e.g. Amara Okonkwo"
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand" />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Email Address *</label>
                      <input id="email" type="email" value={form.email} onChange={e => set("email", e.target.value)} required
                        placeholder="you@example.com"
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand" />
                    </div>
                    <div>
                      <label htmlFor="phone" className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Phone Number</label>
                      <input id="phone" value={form.phone} onChange={e => set("phone", e.target.value)}
                        placeholder="+234 800 000 0000"
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand" />
                    </div>
                    <div>
                      <label htmlFor="service" className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Service Needed</label>
                      <select id="service" value={form.service} onChange={e => set("service", e.target.value)}
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand bg-white">
                        <option value="">Select a service…</option>
                        <option>General Consultation</option>
                        <option>Cataract Surgery</option>
                        <option>Glaucoma Assessment</option>
                        <option>OCT / Retinal Scan</option>
                        <option>Telemedicine</option>
                        <option>Other</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label htmlFor="message" className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Message *</label>
                    <textarea id="message" value={form.message} onChange={e => set("message", e.target.value)} required rows={5}
                      placeholder="Tell us how we can help you…"
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand resize-none" />
                  </div>
                  <button type="submit" disabled={sending}
                    className="w-full flex items-center justify-center gap-2 brand-gradient text-white py-4 rounded-xl font-bold text-sm disabled:opacity-60 shadow-lg shadow-brand-700/20">
                    <Send className="h-4 w-4" /> {sending ? "Sending…" : "Send Message"}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}
