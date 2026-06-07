"use client";
import { useRef, useState, useEffect } from "react";

interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  style?: React.CSSProperties;
  placeholder?: string;
}

/**
 * LazyImage — uses IntersectionObserver to load images only when
 * they enter the viewport. Shows a purple shimmer placeholder first.
 */
export default function LazyImage({ src, alt, className = "", style, placeholder }: LazyImageProps) {
  const ref       = useRef<HTMLDivElement>(null);
  const [loaded, setLoaded]     = useState(false);
  const [inView, setInView]     = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setInView(true); observer.disconnect(); } },
      { rootMargin: "200px", threshold: 0.01 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className={`relative overflow-hidden ${className}`} style={style}>
      {/* Shimmer placeholder */}
      {!loaded && (
        <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-brand-100 via-brand-50 to-brand-100" />
      )}
      {inView && (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          decoding="async"
          onLoad={() => setLoaded(true)}
          className={`w-full h-full object-cover transition-opacity duration-700 ease-in-out ${loaded ? "opacity-100" : "opacity-0"}`}
        />
      )}
    </div>
  );
}
