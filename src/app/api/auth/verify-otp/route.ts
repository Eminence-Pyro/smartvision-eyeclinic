import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { hashPassword } from "@/lib/auth";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  const { email, otp } = await req.json();
  if (!email || !otp) return NextResponse.json({ error: "Email and OTP required" }, { status: 400 });

  const rows = await query<{ otp_secret: string; otp_expires_at: string }>(
    "SELECT otp_secret, otp_expires_at FROM patients WHERE email = $1 LIMIT 1",
    [email.toLowerCase()]
  );

  if (!rows.length) return NextResponse.json({ error: "Patient not found" }, { status: 404 });

  const { otp_secret, otp_expires_at } = rows[0];

  if (otp_secret !== otp) return NextResponse.json({ error: "Invalid OTP" }, { status: 401 });
  if (new Date(otp_expires_at) < new Date()) return NextResponse.json({ error: "OTP expired" }, { status: 401 });

  // Generate temp password for NextAuth credentials flow
  const tempPassword = crypto.randomBytes(32).toString("hex");
  const tempHash     = await hashPassword(tempPassword);

  await query(
    "UPDATE patients SET password_hash = $1, otp_secret = NULL, otp_expires_at = NULL WHERE email = $2",
    [tempHash, email.toLowerCase()]
  );

  return NextResponse.json({ tempPassword });
}
