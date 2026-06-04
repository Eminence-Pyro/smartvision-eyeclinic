import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { generateOTP } from "@/lib/auth";
import nodemailer from "nodemailer";

export async function POST(req: NextRequest) {
  const { email } = await req.json();
  if (!email) return NextResponse.json({ error: "Email required" }, { status: 400 });

  const rows = await query("SELECT id FROM patients WHERE email = $1 LIMIT 1", [email.toLowerCase()]);
  if (!rows.length) return NextResponse.json({ error: "Email not found" }, { status: 404 });

  const otp     = generateOTP();
  const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  await query(
    "UPDATE patients SET otp_secret = $1, otp_expires_at = $2 WHERE email = $3",
    [otp, expires.toISOString(), email.toLowerCase()]
  );

  // Send email
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || "587"),
    secure: false,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });

  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: email,
    subject: "Your Anya Eye Clinic Login Code",
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px">
        <h2 style="color:#1a6b5c">Anya Specialist Eye Clinic</h2>
        <p>Your one-time login code is:</p>
        <div style="font-size:36px;font-weight:900;letter-spacing:8px;color:#1a6b5c;text-align:center;padding:16px;background:#f0f9f7;border-radius:12px;margin:16px 0">
          ${otp}
        </div>
        <p style="color:#666;font-size:14px">This code expires in <strong>10 minutes</strong>. Do not share it with anyone.</p>
      </div>
    `,
  });

  return NextResponse.json({ message: "OTP sent" });
}
