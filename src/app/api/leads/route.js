import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { addMonths, getActiveCommissionRule } from "@/lib/commission";

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

    const leads = await prisma.partnerLead.findMany({
      where: { partnerId: partner.id },
      orderBy: { registeredAt: "desc" },
      include: {
        commissions: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    return NextResponse.json({ leads });
  } catch (error) {
    console.error("GET /api/leads error:", error);
    return NextResponse.json({ error: "Interne fout." }, { status: 500 });
  }
}

export async function POST(request) {
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

    const body = await request.json();

    const companyName = String(body.companyName || "").trim();
    const vatNumberRaw = String(body.vatNumber || "").trim();
    const contactName = body.contactName ? String(body.contactName).trim() : null;
    const contactEmail = body.contactEmail
      ? String(body.contactEmail).trim().toLowerCase()
      : null;

    if (!companyName || !vatNumberRaw) {
      return NextResponse.json(
        { error: "Bedrijfsnaam en ondernemingsnummer zijn verplicht." },
        { status: 400 }
      );
    }

    const vatRegex = /^0\.\d{3}\.\d{3}\.\d{3}$/;

    if (!vatRegex.test(vatNumberRaw)) {
      return NextResponse.json(
        { error: "Ondernemingsnummer moet formaat 0.xxx.xxx.xxx hebben." },
        { status: 400 }
      );
    }

    const vatNumberNormalized = vatNumberRaw.replace(/\D/g, "");

    const existingLead = await prisma.partnerLead.findUnique({
      where: { vatNumberNormalized },
      select: { id: true },
    });

    if (existingLead) {
      return NextResponse.json(
        { error: "Lead bestaat al." },
        { status: 409 }
      );
    }

    const now = new Date();
    const rule = await getActiveCommissionRule();

    const commissionEligibleUntil =
      rule?.durationMonths != null ? addMonths(now, rule.durationMonths) : null;

    const lead = await prisma.partnerLead.create({
      data: {
        partnerId: partner.id,
        companyName,
        vatNumberRaw,
        vatNumberNormalized,
        contactName,
        contactEmail,
        status: "REGISTERED",
        registeredAt: now,
        commissionEligibleFrom: now,
        commissionEligibleUntil,
        events: {
          create: {
            type: "LEAD_CREATED",
            message: "Lead toegevoegd door partner.",
          },
        },
      },
    });

    return NextResponse.json({ ok: true, lead });
  } catch (error) {
    console.error("POST /api/leads error:", error);
    return NextResponse.json({ error: "Interne fout." }, { status: 500 });
  }
}