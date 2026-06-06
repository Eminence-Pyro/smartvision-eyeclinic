import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { query } from "@/lib/db";

export const authOptions: NextAuthOptions = {
  providers: [
    /* ── Google OAuth ── */
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [
          GoogleProvider({
            clientId:     process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          }),
        ]
      : []),

    /* ── Staff (email + password) ── */
    CredentialsProvider({
      id:   "staff-credentials",
      name: "Staff",
      credentials: {
        email:    { label: "Email",    type: "email"    },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const rows = await query<{
          id: string; first_name: string; last_name: string;
          email: string; role: string; password_hash: string; is_active: boolean;
        }>(
          "SELECT id, first_name, last_name, email, role, password_hash, is_active FROM staff WHERE email=$1",
          [credentials.email.toLowerCase()]
        );
        const staff = rows[0];
        if (!staff || !staff.is_active) return null;
        const ok = await bcrypt.compare(credentials.password, staff.password_hash);
        if (!ok) return null;
        return { id: staff.id, name: `${staff.first_name} ${staff.last_name}`, email: staff.email, role: staff.role };
      },
    }),

    /* ── Patient (email + password) ── */
    CredentialsProvider({
      id:   "patient-credentials",
      name: "Patient",
      credentials: {
        email:    { label: "Email",    type: "email"    },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const rows = await query<{
          id: string; first_name: string; last_name: string;
          email: string; password_hash: string; email_verified: boolean;
        }>(
          "SELECT id, first_name, last_name, email, password_hash, email_verified FROM patients WHERE email=$1",
          [credentials.email.toLowerCase()]
        );
        const patient = rows[0];
        if (!patient || !patient.password_hash) return null;
        const ok = await bcrypt.compare(credentials.password, patient.password_hash);
        if (!ok) return null;
        return { id: patient.id, name: `${patient.first_name} ${patient.last_name}`, email: patient.email, role: "patient" };
      },
    }),
  ],

  callbacks: {
    async signIn({ user, account }) {
      /* Handle Google OAuth sign-in — create or fetch patient record */
      if (account?.provider === "google") {
        const email = user.email?.toLowerCase();
        if (!email) return false;
        const existing = await query<{ id: string; role?: string }>(
          "SELECT id FROM patients WHERE email=$1", [email]
        );
        if (existing.length === 0) {
          /* Auto-register patient via Google */
          const nameParts = (user.name || "").split(" ");
          const firstName = nameParts[0] || "Google";
          const lastName  = nameParts.slice(1).join(" ") || "User";
          const patNum    = await generatePatientNumber();
          await query(
            `INSERT INTO patients (first_name, last_name, email, patient_number, email_verified)
             VALUES ($1,$2,$3,$4,TRUE)`,
            [firstName, lastName, email, patNum]
          );
        }
        (user as { role?: string }).role = "patient";
      }
      return true;
    },

    async jwt({ token, user, account }) {
      if (user) {
        token.id   = user.id;
        token.role = (user as { role?: string }).role || "patient";
      }
      if (account?.provider === "google" && !token.role) {
        token.role = "patient";
      }
      return token;
    },

    async session({ session, token }) {
      if (token) {
        (session.user as { id?: string }).id     = token.id as string;
        (session.user as { role?: string }).role  = token.role as string;
      }
      return session;
    },
  },

  pages: {
    signIn:  "/portal/login",
    error:   "/portal/login",
  },

  session: { strategy: "jwt", maxAge: 24 * 60 * 60 },
  secret:  process.env.NEXTAUTH_SECRET,
};

/* ── Helpers ── */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function generatePatientNumber(): Promise<string> {
  const year  = new Date().getFullYear();
  const rows  = await query<{ count: string }>(
    "SELECT COUNT(*) as count FROM patients WHERE patient_number LIKE $1",
    [`ASE/${year}/%`]
  );
  const count = parseInt(rows[0]?.count || "0") + 1;
  return `ASE/${year}/${count.toString().padStart(4, "0")}`;
}
