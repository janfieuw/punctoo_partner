import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const PARTNER_EMAIL = "jan@punctoo.be";

export async function GET() {
  try {
    const partner = await prisma.partner.findUnique({
      where: { email: PARTNER_EMAIL },
    });

    if (!partner) {
      return NextResponse.json(
        { error: "Partner niet gevonden." },
        { status: 404 }
      );
    }

    const commissions = await prisma.partnerCommission.findMany({
      where: { partnerId: partner.id },
      orderBy: { createdAt: "desc" },
      include: {
        lead: true,
      },
    });

    return NextResponse.json({ commissions });
  } catch (error) {
    console.error("GET /api/commissions error:", error);
    return NextResponse.json({ error: "Interne fout." }, { status: 500 });
  }
}