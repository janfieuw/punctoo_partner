import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requirePartnerSession } from "@/lib/auth";
import { normalizeVatNumber, isValidNormalizedBelgianVat } from "@/lib/vat";
import { addMonths, getActiveCommissionRule } from "@/lib/commission";

export async function GET() {
  try {
    const session = await requirePartnerSession();

    const leads = await prisma.partnerLead.findMany({
      where: { partnerId: session.partnerId },
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
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function POST(request) {
  try {
    const session = await requirePartnerSession();
    const body = await request.json();

    const companyName = String(body.companyName || "").trim();
    const vatNumberRaw = String(body.vatNumber || "").trim();
    const contactName = body.contactName ? String(body.contactName).trim() : null;
    const contactEmail = body.contactEmail ? String(body.contactEmail).trim().toLowerCase() : null;
    const note = body.note ? String(body.note).trim() : null;

    if (!companyName || !vatNumberRaw) {
      return NextResponse.json(
        { error: "Bedrijfsnaam en ondernemingsnummer zijn verplicht." },
        { status: 400 }
      );
    }

    const vatNumberNormalized = normalizeVatNumber(vatNumberRaw);

    if (!isValidNormalizedBelgianVat(vatNumberNormalized)) {
      return NextResponse.json(
        { error: "Ongeldig ondernemingsnummer." },
        { status: 400 }
      );
    }

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
        partnerId: session.partnerId,
        companyName,
        vatNumberRaw,
        vatNumberNormalized,
        contactName,
        contactEmail,
        note,
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