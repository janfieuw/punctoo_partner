import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { normalizeVatNumber, isValidNormalizedBelgianVat } from "@/lib/vat";
import { getActiveCommissionRule, isWithinEligibilityWindow } from "@/lib/commission";

export async function POST(request) {
  try {
    const secret = request.headers.get("x-internal-secret");

    if (secret !== process.env.INTERNAL_SYNC_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    const companyId = body.companyId ? String(body.companyId) : null;
    const companyName = body.companyName ? String(body.companyName) : null;
    const vatNumber = body.vatNumber ? String(body.vatNumber) : null;
    const trialStartsAt = body.trialStartsAt ? new Date(body.trialStartsAt) : null;
    const activatedAt = body.activatedAt ? new Date(body.activatedAt) : null;

    const vatNumberNormalized = normalizeVatNumber(vatNumber);

    if (!isValidNormalizedBelgianVat(vatNumberNormalized)) {
      return NextResponse.json({ ok: true, skipped: "invalid_vat" });
    }

    const lead = await prisma.partnerLead.findUnique({
      where: { vatNumberNormalized },
    });

    if (!lead) {
      return NextResponse.json({ ok: true, skipped: "lead_not_found" });
    }

    const eventCreates = [];
    const updateData = {};

    if (!lead.matchedCompanyId && companyId) {
      updateData.matchedCompanyId = companyId;
      updateData.matchedAt = new Date();

      eventCreates.push({
        type: "MATCH_FOUND",
        message: "Match gevonden met klant in MyPunctoo.",
        payloadJson: { companyId, companyName },
      });
    }

    if (trialStartsAt && !lead.trialStartedAt) {
      updateData.trialStartedAt = trialStartsAt;
      if (lead.status === "REGISTERED") {
        updateData.status = "TRIAL_STARTED";
      }

      eventCreates.push({
        type: "TRIAL_STARTED",
        message: "Lead heeft testperiode gestart.",
        payloadJson: { trialStartsAt },
      });
    }

    if (activatedAt && !lead.activatedAt) {
      updateData.activatedAt = activatedAt;
      updateData.status = "ACTIVATED";

      eventCreates.push({
        type: "ACTIVATED",
        message: "Lead heeft abonnement geactiveerd.",
        payloadJson: { activatedAt },
      });
    }

    await prisma.partnerLead.update({
      where: { id: lead.id },
      data: {
        ...updateData,
        ...(eventCreates.length
          ? {
              events: {
                create: eventCreates,
              },
            }
          : {}),
      },
    });

    if (activatedAt) {
      const existingCommission = await prisma.partnerCommission.findFirst({
        where: { leadId: lead.id },
      });

      if (!existingCommission) {
        const refreshedLead = await prisma.partnerLead.findUnique({
          where: { id: lead.id },
        });

        const eligible = isWithinEligibilityWindow(refreshedLead, activatedAt);

        if (eligible) {
          const rule = await getActiveCommissionRule();

          await prisma.partnerCommission.create({
            data: {
              partnerId: refreshedLead.partnerId,
              leadId: refreshedLead.id,
              companyId,
              status: "EARNED",
              ruleNameSnapshot: rule?.name || "Default",
              percentSnapshot: rule?.commissionPercent || null,
              amountSnapshot: rule?.flatAmount || null,
              eligibleFrom: refreshedLead.commissionEligibleFrom || new Date(),
              eligibleUntil: refreshedLead.commissionEligibleUntil || null,
              triggeredAt: new Date(),
            },
          });

          await prisma.partnerLeadEvent.create({
            data: {
              leadId: refreshedLead.id,
              type: "COMMISSION_CREATED",
              message: "Commissie aangemaakt na activatie.",
              payloadJson: { companyId, activatedAt },
            },
          });
        } else {
          await prisma.partnerLead.update({
            where: { id: refreshedLead.id },
            data: { status: "EXPIRED" },
          });

          await prisma.partnerLeadEvent.create({
            data: {
              leadId: refreshedLead.id,
              type: "COMMISSION_EXPIRED",
              message: "Activatie viel buiten de geldigheidsperiode.",
              payloadJson: { companyId, activatedAt },
            },
          });
        }
      }
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("POST /api/internal/company-status error:", error);
    return NextResponse.json({ error: "Interne fout." }, { status: 500 });
  }
}