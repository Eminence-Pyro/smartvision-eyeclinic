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
        brand: {
          DEFAULT: "#1a6b5c",
          50:  "#f0f9f7",
          100: "#d0ede9",
          200: "#a1dbd3",
          300: "#6bbdb2",
          400: "#3e9b8e",
          500: "#1a6b5c",
          600: "#155549",
          700: "#0f3f36",
          800: "#092a23",
          900: "#041511",
        },
        gold: {
          DEFAULT: "#c9a84c",
          light:   "#f0d080",
        },
      },
      fontFamily: {
        sans:  ["var(--font-inter)", "system-ui", "sans-serif"],
        serif: ["var(--font-playfair)", "Georgia", "serif"],
      },
    },
  },
  plugins: [],
};

export default config;
