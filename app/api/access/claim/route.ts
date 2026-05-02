import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { hasEntitlement } from "@/lib/database";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const formData = await request.formData();
  const rawEmail = formData.get("email");
  const email = typeof rawEmail === "string" ? rawEmail.trim().toLowerCase() : "";

  if (!email) {
    return NextResponse.redirect(new URL("/dashboard?error=missing_email", request.url));
  }

  const entitled = await hasEntitlement(email);
  if (!entitled) {
    return NextResponse.redirect(new URL("/dashboard?error=not_found", request.url));
  }

  const cookieStore = await cookies();
  cookieStore.set("ccd_access", "granted", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30
  });

  return NextResponse.redirect(new URL("/dashboard?claimed=1", request.url));
}
