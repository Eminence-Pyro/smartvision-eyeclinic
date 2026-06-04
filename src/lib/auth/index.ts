import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { query } from "@/lib/db";
import type { Staff, Patient } from "@/lib/types";

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt", maxAge: 24 * 60 * 60 },
  pages: {
    signIn: "/login",
    error:  "/login",
  },
  providers: [
    CredentialsProvider({
      id:   "staff-login",
      name: "Staff",
      credentials: {
        email:    { label: "Email",    type: "email"    },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const rows = await query<Staff & { password_hash: string }>(
          "SELECT * FROM staff WHERE email = $1 AND is_active = TRUE LIMIT 1",
          [credentials.email.toLowerCase()]
        );
        if (!rows.length) return null;
        const staff = rows[0];
        const valid = await bcrypt.compare(credentials.password, staff.password_hash);
        if (!valid) return null;
        return {
          id:    staff.id,
          email: staff.email,
          name:  `${staff.first_name} ${staff.last_name}`,
          role:  staff.role,
          type:  "staff",
        };
      },
    }),
    CredentialsProvider({
      id:   "patient-login",
      name: "Patient",
      credentials: {
        email:    { label: "Email",    type: "email"    },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const rows = await query<Patient & { password_hash: string }>(
          "SELECT * FROM patients WHERE email = $1 LIMIT 1",
          [credentials.email.toLowerCase()]
        );
        if (!rows.length) return null;
        const patient = rows[0];
        if (!patient.password_hash) return null;
        const valid = await bcrypt.compare(credentials.password, patient.password_hash);
        if (!valid) return null;
        return {
          id:    patient.id,
          email: patient.email ?? "",
          name:  `${patient.first_name} ${patient.last_name}`,
          role:  "patient" as const,
          type:  "patient",
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id   = user.id;
        token.role = (user as { role: string }).role;
        token.type = (user as { type: string }).type;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as { id: string }).id     = token.id as string;
        (session.user as { role: string }).role = token.role as string;
        (session.user as { type: string }).type = token.type as string;
      }
      return session;
    },
  },
};

// Helper: hash password
export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 12);
}

// Helper: generate 6-digit OTP
export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Helper: generate patient number ASE/YYYY/NNN
export async function generatePatientNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const rows = await query<{ count: string }>(
    "SELECT COUNT(*) as count FROM patients WHERE patient_number LIKE $1",
    [`ASE/${year}/%`]
  );
  const seq = (parseInt(rows[0]?.count || "0") + 1).toString().padStart(4, "0");
  return `ASE/${year}/${seq}`;
}

// Role-based access helper
export const ROLE_PERMISSIONS: Record<string, string[]> = {
  admin:      ["*"],
  doctor:     ["patients:read", "visits:read", "vitals:read", "va:read", "notes:write", "prescriptions:write", "scans:write", "surgeries:write", "queue:read"],
  front_desk: ["patients:write", "vitals:write", "visits:write", "queue:write"],
  va_room:    ["va:write", "visits:read", "patients:read"],
  accounts:   ["payments:write", "visits:read", "patients:read"],
  scan_room:  ["scans:write", "visits:read", "patients:read"],
  theatre:    ["surgeries:write", "visits:read", "patients:read"],
  pharmacy:   ["prescriptions:read", "prescriptions:write", "payments:read"],
  patient:    ["own:*"],
};

export function hasPermission(role: string, permission: string): boolean {
  const perms = ROLE_PERMISSIONS[role] || [];
  return perms.includes("*") || perms.includes(permission);
}
