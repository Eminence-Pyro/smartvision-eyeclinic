"use client";

interface LogoProps {
  size?: number;
  className?: string;
  showText?: boolean;
  textColor?: "white" | "dark";
}

export default function Logo({ size = 40, className = "", showText = true, textColor = "dark" }: LogoProps) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* IOL + Eye SVG */}
      <div style={{ width: size, height: size }} className="flex-shrink-0">
        <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"
          style={{ width: "100%", height: "100%" }}>
          {/* IOL haptic arms */}
          <path d="M12 24 C9 13, 18 7, 24 7 C30 7, 39 13, 36 24"
            stroke="url(#g1)" strokeWidth="2.8" strokeLinecap="round" fill="none"/>
          <path d="M12 24 C9 35, 18 41, 24 41 C30 41, 39 35, 36 24"
            stroke="url(#g1)" strokeWidth="2.8" strokeLinecap="round" fill="none"/>
          {/* IOL optic zone */}
          <circle cx="24" cy="24" r="11.5"
            stroke="url(#g1)" strokeWidth="1.8" fill="url(#g2)" fillOpacity="0.12"/>
          {/* Iris */}
          <circle cx="24" cy="24" r="8.5" fill="url(#g1)"/>
          {/* Pupil */}
          <circle cx="24" cy="24" r="4.2" fill="#1e1b4b"/>
          {/* Highlight */}
          <circle cx="26.8" cy="21.2" r="1.6" fill="white" fillOpacity="0.9"/>
          <defs>
            <linearGradient id="g1" x1="4" y1="4" x2="44" y2="44" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#7c3aed"/>
              <stop offset="100%" stopColor="#2563eb"/>
            </linearGradient>
            <linearGradient id="g2" x1="4" y1="4" x2="44" y2="44" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#7c3aed"/>
              <stop offset="100%" stopColor="#2563eb"/>
            </linearGradient>
          </defs>
        </svg>
      </div>
      {showText && (
        <div>
          <p className={`font-bold text-sm leading-none ${textColor === "white" ? "text-white" : "text-gray-900"}`}>
            Anya Specialist
          </p>
          <p className={`text-[10px] tracking-[0.18em] uppercase mt-0.5 font-semibold ${textColor === "white" ? "text-white/60" : "text-brand-600"}`}>
            Eye Clinic
          </p>
        </div>
      )}
    </div>
  );
}
