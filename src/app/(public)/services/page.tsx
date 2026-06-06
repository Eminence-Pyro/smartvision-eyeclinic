"use client";
import Link from "next/link";
import Navbar from "@/components/ui/Navbar";
import Footer from "@/components/ui/Footer";
import { ArrowRight, CheckCircle } from "lucide-react";

const SERVICES = [
  {
    icon:"👁️", title:"Comprehensive Eye Examination",
    desc:"Our complete eye exam includes visual acuity testing, refraction, slit-lamp examination, fundoscopy, and intraocular pressure measurement.",
    features:["Visual acuity & refraction","Slit-lamp anterior segment","Indirect ophthalmoscopy","IOP measurement (NCT & Goldmann)"],
    img:"https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&q=80",
  },
  {
    icon:"🔬", title:"Cataract Surgery (Phacoemulsification)",
    desc:"We perform small-incision phacoemulsification with premium IOL implantation. Most patients achieve excellent vision within 24 hours.",
    features:["Small-incision surgery","Premium monofocal & multifocal IOLs","B-scan biometry for lens power calculation","Post-operative care included"],
    img:"https://images.unsplash.com/photo-1551190822-a9333d879b1f?w=800&q=80",
  },
  {
    icon:"💧", title:"Glaucoma Diagnosis & Surgery",
    desc:"We diagnose and manage all types of glaucoma with gonioscopy, visual field testing, OCT nerve fibre layer analysis, and surgical intervention when required.",
    features:["Gonioscopy","Pachymetry","Visual fields (confrontation & automated)","Trabeculectomy & glaucoma drainage devices"],
    img:"https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=800&q=80",
  },
  {
    icon:"📷", title:"Retinal Imaging & OCT",
    desc:"High-resolution optical coherence tomography for diabetic retinopathy, AMD, macular holes, and retinal vein occlusion.",
    features:["Macular OCT","Optic disc OCT","Fundus photography","Diabetic retinopathy screening"],
    img:"https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&q=80",
  },
  {
    icon:"🏥", title:"Surgical Procedures",
    desc:"Our fully equipped theatre handles vitreoretinal surgery, pterygium excision, lid surgery, squint correction, and more.",
    features:["Vitrectomy","Pterygium excision + graft","Lid (entropion/ectropion) surgery","Squint (strabismus) correction"],
    img:"https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&q=80",
  },
  {
    icon:"🌐", title:"Telemedicine & Outreach",
    desc:"Can't make it to the clinic? Our telemedicine service connects you with a doctor from anywhere. We also run free community eye camps monthly.",
    features:["Video consultation from your phone","Pre-consultation AI triage (Zinny)","Monthly community eye camps","Student health screening programmes"],
    img:"https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800&q=80",
  },
];

export default function ServicesPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="relative pt-24 pb-20"
        style={{ backgroundImage:"url(https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1800&q=80)", backgroundSize:"cover", backgroundPosition:"center" }}>
        <div className="absolute inset-0 bg-gradient-to-r from-brand-900/95 to-brand-800/80" />
        <div className="relative z-10 max-w-7xl mx-auto px-6 py-16">
          <p className="text-brand-300 text-xs font-bold uppercase tracking-widest mb-3">What We Offer</p>
          <h1 className="font-serif font-black text-5xl text-white mb-4">Our Services</h1>
          <p className="text-white/70 max-w-xl text-lg">Comprehensive eye care from simple exams to complex surgery — all under one roof.</p>
        </div>
      </div>

      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto space-y-16">
          {SERVICES.map((svc, i) => (
            <div key={svc.title} className={`grid grid-cols-1 lg:grid-cols-2 gap-12 items-center ${i % 2 === 1 ? "lg:flex-row-reverse" : ""}`}>
              <div className={i % 2 === 1 ? "lg:order-2" : ""}>
                <div className="text-3xl mb-3">{svc.icon}</div>
                <h2 className="font-serif font-bold text-3xl text-gray-900 mb-4">{svc.title}</h2>
                <p className="text-gray-600 leading-relaxed mb-5">{svc.desc}</p>
                <ul className="space-y-2.5 mb-6">
                  {svc.features.map(f => (
                    <li key={f} className="flex items-center gap-2.5 text-sm text-gray-700">
                      <CheckCircle className="h-4 w-4 text-brand flex-shrink-0" /> {f}
                    </li>
                  ))}
                </ul>
                <Link href="/contact"
                  className="inline-flex items-center gap-2 brand-gradient text-white rounded-full px-6 py-3 text-sm font-bold hover:opacity-90 transition-all shadow-lg shadow-brand-700/20">
                  Book This Service <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
              <div className={`rounded-2xl overflow-hidden shadow-xl aspect-video ${i % 2 === 1 ? "lg:order-1" : ""}`}>
                <img src={svc.img} alt={svc.title} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
              </div>
            </div>
          ))}
        </div>
      </section>
      <Footer />
    </div>
  );
}
