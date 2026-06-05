import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Anya Specialist Eye Clinic",
};

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
