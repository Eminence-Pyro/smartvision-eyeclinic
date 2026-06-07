"use client";
import { useRef, useState, useEffect } from "react";

interface Props {
  children: React.ReactNode;
  className?: string;
  delay?: number; // ms stagger delay
}

/**
 * LazySection — wraps any content and fades it in when it enters the viewport.
 * Use delay prop to stagger multiple sections.
 */
export default function LazySection({ children, className = "", delay = 0 }: Props) {
  const ref     = useRef<HTMLDivElement>(null);
  const [vis, setVis] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVis(true); observer.disconnect(); } },
      { rootMargin: "80px", threshold: 0.05 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`transition-all duration-700 ease-out ${vis ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"} ${className}`}
    >
      {children}
    </div>
  );
}
