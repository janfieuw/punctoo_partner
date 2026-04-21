import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

const SESSION_COOKIE = "punctoo_partner_session";

export async function getPartnerSession() {
  const cookieStore = await cookies();
  const value = cookieStore.get(SESSION_COOKIE)?.value;

  if (!value) return null;

  const partner = await prisma.partner.findUnique({
    where: { id: value },
    select: {
      id: true,
      name: true,
      email: true,
      active: true,
    },
  });

  if (!partner || !partner.active) return null;

  return {
    partnerId: partner.id,
    partnerName: partner.name,
    partnerEmail: partner.email,
  };
}

export async function requirePartnerSession() {
  const session = await getPartnerSession();

  if (!session) {
    throw new Error("UNAUTHORIZED");
  }

  return session;
}

export async function setPartnerSession(partnerId) {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, partnerId, {
    httpOnly: true,
    sameSite: "lax",
    secure: false,
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function clearPartnerSession() {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: false,
    path: "/",
    maxAge: 0,
  });
}