import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // ── PRIMARY: Purple ───────────────────────────────
        brand: {
          DEFAULT: "#7c3aed",   // violet-600 — dominant colour
          50:  "#f5f3ff",
          100: "#ede9fe",
          200: "#ddd6fe",
          300: "#c4b5fd",
          400: "#a78bfa",
          500: "#8b5cf6",
          600: "#7c3aed",
          700: "#6d28d9",
          800: "#5b21b6",
          900: "#4c1d95",
          950: "#2e1065",
        },
        // ── SECONDARY: Blue (accent only) ─────────────────
        accent: {
          DEFAULT: "#2563eb",
          50:  "#eff6ff",
          100: "#dbeafe",
          200: "#bfdbfe",
          300: "#93c5fd",
          400: "#60a5fa",
          500: "#3b82f6",
          600: "#2563eb",
          700: "#1d4ed8",
          800: "#1e40af",
          900: "#1e3a8a",
        },
      },
      fontFamily: {
        sans:  ["var(--font-inter)", "system-ui", "sans-serif"],
        serif: ["var(--font-playfair)", "Georgia", "serif"],
      },
      backgroundImage: {
        // Purple dominant gradient with blue as a hint on the right
        "brand-gradient":      "linear-gradient(135deg, #7c3aed 0%, #6d28d9 60%, #2563eb 100%)",
        "brand-gradient-soft": "linear-gradient(135deg, #8b5cf6 0%, #7c3aed 70%, #3b82f6 100%)",
        "brand-gradient-hero": "linear-gradient(135deg, #4c1d95 0%, #7c3aed 50%, #1d4ed8 100%)",
      },
    },
  },
  plugins: [],
};

export default config;
