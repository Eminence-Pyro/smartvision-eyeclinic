"use client";
import Link from "next/link";
import Logo from "./Logo";
import { Phone, Mail, MapPin, Clock, Facebook, Instagram, Twitter, Linkedin, Youtube } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-gray-950 text-gray-400">
      {/* CTA banner */}
      <div className="brand-gradient py-14 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-serif font-black text-3xl text-white mb-3">Your Vision Deserves the Best</h2>
          <p className="text-white/70 mb-7 text-lg">Book a consultation today — because every moment of clear sight matters.</p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/portal/register"
              className="bg-white text-brand font-bold rounded-full px-8 py-3.5 hover:bg-gray-50 transition-all shadow-xl">
              Book Appointment
            </Link>
            <Link href="/portal/login"
              className="border-2 border-white text-white rounded-full px-8 py-3.5 font-semibold hover:bg-white/10 transition-all">
              Patient Portal
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div className="md:col-span-1">
            <Logo size={36} textColor="white" className="mb-4" />
            <p className="text-sm leading-relaxed mb-5">
              World-class ophthalmology care delivered with compassion and cutting-edge technology.
            </p>
            <div className="flex gap-3">
              {[
                { Icon: Facebook,  href: "#" },
                { Icon: Instagram, href: "#" },
                { Icon: Twitter,   href: "#" },
                { Icon: Linkedin,  href: "#" },
                { Icon: Youtube,   href: "#" },
              ].map(({ Icon, href }) => (
                <a key={href} href={href}
                  className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-brand transition-all">
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick links */}
          <div>
            <p className="text-white font-bold text-sm mb-4 uppercase tracking-widest">Quick Links</p>
            <ul className="space-y-2.5 text-sm">
              {["/", "/about", "/services", "/blog", "/contact"].map((href, i) => (
                <li key={href}>
                  <Link href={href} className="hover:text-white transition-colors">
                    {["Home","About Us","Services","Blog","Contact"][i]}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Portals */}
          <div>
            <p className="text-white font-bold text-sm mb-4 uppercase tracking-widest">Portals</p>
            <ul className="space-y-2.5 text-sm">
              <li><Link href="/portal/login"    className="hover:text-white">Patient Login</Link></li>
              <li><Link href="/portal/register" className="hover:text-white">Register</Link></li>
              <li><Link href="/staff/login"     className="hover:text-white">Staff Login</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <p className="text-white font-bold text-sm mb-4 uppercase tracking-widest">Contact</p>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2.5"><Phone className="h-4 w-4 mt-0.5 text-brand-400 flex-shrink-0" /><span>+234 XXX XXX XXXX</span></li>
              <li className="flex items-start gap-2.5"><Mail  className="h-4 w-4 mt-0.5 text-brand-400 flex-shrink-0" /><span>info@anyaeyeclinic.com</span></li>
              <li className="flex items-start gap-2.5"><MapPin className="h-4 w-4 mt-0.5 text-brand-400 flex-shrink-0" /><span>Anya Specialist Eye Clinic, Nigeria</span></li>
              <li className="flex items-start gap-2.5"><Clock  className="h-4 w-4 mt-0.5 text-brand-400 flex-shrink-0" /><span>Mon–Sat 8:00am – 5:00pm</span></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
          <p>© {new Date().getFullYear()} Anya Specialist Eye Clinic. All rights reserved.</p>
          <p>SmartVision Platform · Built by Eminence</p>
        </div>
      </div>
    </footer>
  );
}
