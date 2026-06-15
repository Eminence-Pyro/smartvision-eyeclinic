import { NextRequest, NextResponse } from "next/server";

// Simple IP-based rate limit store (edge-compatible, resets between cold starts)
const attempts = new Map<string, { count: number; resetAt: number }>();

const RATE_LIMIT_WINDOW = 60_000; // 1 minute
const MAX_LOGIN_ATTEMPTS = 8;     // per IP per minute

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Only rate-limit the NextAuth signin endpoint
  if (pathname === "/api/auth/callback/credentials" || pathname === "/api/auth/signin") {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    const now = Date.now();
    const entry = attempts.get(ip);

    if (!entry || now > entry.resetAt) {
      attempts.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW });
    } else {
      entry.count++;
      if (entry.count > MAX_LOGIN_ATTEMPTS) {
        return NextResponse.json(
          { error: "Too many login attempts. Please wait 1 minute and try again." },
          { status: 429 }
        );
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/api/auth/:path*"],
};
