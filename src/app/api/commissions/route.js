import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requirePartnerSession } from "@/lib/auth";

export async function GET() {
  try {
    const session = await requirePartnerSession();

    const commissions = await prisma.partnerCommission.findMany({
      where: { partnerId: session.partnerId },
      orderBy: { createdAt: "desc" },
      include: {
        lead: true,
      },
    });

    return NextResponse.json({ commissions });
  } catch (error) {
    console.error("GET /api/commissions error:", error);
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}