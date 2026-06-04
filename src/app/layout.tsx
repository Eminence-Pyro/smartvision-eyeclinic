import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import SessionProvider from "@/components/providers/SessionProvider";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair", display: "swap" });

export const metadata: Metadata = {
  title: { default: "Anya Specialist Eye Clinic", template: "%s | Anya Eye Clinic" },
  description: "Specialist eye care services — consultations, surgeries, OCT scans and more. Book your appointment today.",
  keywords: ["eye clinic", "ophthalmologist", "eye surgery", "phacoemulsification", "glaucoma", "Nigeria"],
  openGraph: {
    type: "website",
    title: "Anya Specialist Eye Clinic",
    description: "Expert eye care. Trusted specialists.",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <body className="antialiased">
        <SessionProvider>
          {children}
          <Toaster richColors position="top-right" />
        </SessionProvider>
      </body>
    </html>
  );
}
