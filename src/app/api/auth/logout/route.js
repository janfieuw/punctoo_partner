import { NextResponse } from "next/server";
import { clearPartnerSession } from "@/lib/auth";

export async function POST(request) {
  await clearPartnerSession();
  return NextResponse.redirect(new URL("/login", request.url));
}