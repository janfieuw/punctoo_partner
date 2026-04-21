import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { setPartnerSession } from "@/lib/auth";

export async function POST(request) {
  try {
    const formData = await request.formData();

    const email = String(formData.get("email") || "").trim().toLowerCase();
    const password = String(formData.get("password") || "");

    if (!email || !password) {
      console.log("LOGIN FAIL: missing email or password");
      return NextResponse.redirect(new URL("/login", request.url));
    }

    const partner = await prisma.partner.findUnique({
      where: { email },
    });

    if (!partner) {
      console.log("LOGIN FAIL: partner not found", email);
      return NextResponse.redirect(new URL("/login", request.url));
    }

    if (!partner.active) {
      console.log("LOGIN FAIL: partner inactive", email);
      return NextResponse.redirect(new URL("/login", request.url));
    }

    const valid = await bcrypt.compare(password, partner.passwordHash);

    if (!valid) {
      console.log("LOGIN FAIL: invalid password", email);
      return NextResponse.redirect(new URL("/login", request.url));
    }

    await setPartnerSession(partner.id);

    console.log("LOGIN OK:", email);

    return NextResponse.redirect(new URL("/dashboard", request.url));
  } catch (error) {
    console.error("POST /api/auth/login error:", error);
    return NextResponse.redirect(new URL("/login", request.url));
  }
}