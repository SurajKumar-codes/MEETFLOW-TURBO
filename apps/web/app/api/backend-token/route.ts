import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import jwt from "jsonwebtoken";

/**
 * Mints a short-lived, signed JWT that the Express backend can verify.
 *
 * The session itself lives in an httpOnly NextAuth cookie that client JS can't
 * read, so the browser can't forge a `userId`. This route reads that cookie
 * server-side, confirms the user is authenticated, and issues a token bound to
 * their id and signed with the secret shared with the backend.
 */

// Keep this short — the client refreshes it automatically.
const TOKEN_TTL_SECONDS = 15 * 60;

export async function GET(req: NextRequest) {
  const sessionToken = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const userId = sessionToken?.id as string | undefined;
  if (!userId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const secret = process.env.BACKEND_JWT_SECRET;
  if (!secret) {
    console.error("BACKEND_JWT_SECRET is not set");
    return NextResponse.json(
      { message: "Server auth is misconfigured" },
      { status: 500 }
    );
  }

  const token = jwt.sign({ sub: userId }, secret, {
    expiresIn: TOKEN_TTL_SECONDS,
  });

  return NextResponse.json(
    { token, expiresAt: Date.now() + TOKEN_TTL_SECONDS * 1000 },
    { headers: { "Cache-Control": "no-store" } }
  );
}
