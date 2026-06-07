"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Menu, X, Phone } from "lucide-react";
import Logo from "./Logo";
import { cn } from "@/lib/utils";

const NAV = [
  { label: "Home",     href: "/" },
  { label: "About",    href: "/about" },
  { label: "Services", href: "/services" },
  { label: "Blog",     href: "/blog" },
  { label: "Contact",  href: "/contact" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [open, setOpen]         = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  return (
    <nav className={cn(
      "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
      scrolled
        ? "bg-white/98 backdrop-blur shadow-lg shadow-gray-100/50 border-b border-gray-100"
        : "bg-white/90 backdrop-blur"
    )}>
      {/* Top bar */}
      <div className="hidden md:block brand-gradient text-white text-xs py-1.5">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <span className="flex items-center gap-1.5"><Phone className="h-3 w-3" /> +234 XXX XXX XXXX</span>
          <span>Mon–Sat 8am–5pm · Emergencies 24/7</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" onClick={() => setOpen(false)}>
          <Logo size={36} />
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-1">
          {NAV.map(l => (
            <Link key={l.href} href={l.href}
              className={cn(
                "px-4 py-2 rounded-xl text-sm font-medium transition-all",
                pathname === l.href
                  ? "text-brand bg-brand-50 font-semibold"
                  : "text-gray-600 hover:text-brand hover:bg-brand-50/50"
              )}>
              {l.label}
            </Link>
          ))}
        </div>

        {/* CTA — only Patient Portal is public-facing */}
        <div className="hidden md:flex items-center gap-3">
          <Link href="/portal/login"
            className="text-brand border-2 border-brand rounded-full px-5 py-2 text-sm font-semibold hover:bg-brand-50 transition-all">
            Patient Portal
          </Link>
          <Link href="/contact"
            className="brand-gradient text-white rounded-full px-5 py-2 text-sm font-bold shadow hover:opacity-90 transition-all">
            Book Now
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button onClick={() => setOpen(!open)} className="md:hidden p-2 text-gray-600">
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-white border-t border-gray-100 py-4 px-6 space-y-1">
          {NAV.map(l => (
            <Link key={l.href} href={l.href} onClick={() => setOpen(false)}
              className={cn("block px-4 py-2.5 rounded-xl text-sm font-medium transition-all",
                pathname === l.href ? "text-brand bg-brand-50 font-semibold" : "text-gray-600 hover:text-brand hover:bg-brand-50/50"
              )}>
              {l.label}
            </Link>
          ))}
          <div className="pt-3 space-y-2">
            <Link href="/portal/login" onClick={() => setOpen(false)}
              className="block w-full text-center text-brand border-2 border-brand rounded-full px-5 py-2.5 text-sm font-semibold hover:bg-brand-50 transition-all">
              Patient Portal
            </Link>
            <Link href="/contact" onClick={() => setOpen(false)}
              className="block w-full text-center brand-gradient text-white rounded-full px-5 py-2.5 text-sm font-bold shadow hover:opacity-90 transition-all">
              Book Now
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
