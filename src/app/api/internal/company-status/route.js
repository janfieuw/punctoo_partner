import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getActiveCommissionRule, isWithinEligibilityWindow } from "@/lib/commission";

function normalizeVat(value) {
  return String(value || "").replace(/\D/g, "");
}

export async function POST(request) {
  try {
    const secret = request.headers.get("x-internal-secret");

    if (!secret || secret !== process.env.INTERNAL_SYNC_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    const companyId = body.companyId ? String(body.companyId) : null;
    const companyName = body.companyName ? String(body.companyName) : null;
    const vatNumberRaw = body.vatNumber ? String(body.vatNumber) : null;
    const trialStartsAt = body.trialStartsAt ? new Date(body.trialStartsAt) : null;
    const activatedAt = body.activatedAt ? new Date(body.activatedAt) : null;

    const vatNumberNormalized = normalizeVat(vatNumberRaw);

    if (!vatNumberNormalized || vatNumberNormalized.length !== 10) {
      return NextResponse.json({ ok: true, skipped: "invalid_vat" });
    }

    const lead = await prisma.partnerLead.findFirst({
      where: {
        vatNumberNormalized,
      },
      include: {
        commissions: true,
      },
    });

    if (!lead) {
      return NextResponse.json({ ok: true, skipped: "lead_not_found" });
    }

    const updateData = {};
    const events = [];

    if (!lead.matchedCompanyId && companyId) {
      updateData.matchedCompanyId = companyId;
      updateData.matchedAt = new Date();

      events.push({
        type: "MATCH_FOUND",
        message: "Match gevonden met klant in MyPunctoo.",
        payloadJson: {
          companyId,
          companyName,
          vatNumberNormalized,
        },
      });
    }

    if (trialStartsAt && !lead.trialStartedAt) {
      updateData.trialStartedAt = trialStartsAt;

      if (lead.status === "REGISTERED") {
        updateData.status = "TRIAL_STARTED";
      }

      events.push({
        type: "TRIAL_STARTED",
        message: "Lead heeft testperiode gestart.",
        payloadJson: {
          companyId,
          companyName,
          trialStartsAt,
        },
      });
    }

    if (activatedAt && !lead.activatedAt) {
      updateData.activatedAt = activatedAt;
      updateData.status = "ACTIVATED";

      events.push({
        type: "ACTIVATED",
        message: "Lead heeft abonnement geactiveerd.",
        payloadJson: {
          companyId,
          companyName,
          activatedAt,
        },
      });
    }

    await prisma.partnerLead.update({
      where: { id: lead.id },
      data: {
        ...updateData,
        ...(events.length
          ? {
              events: {
                create: events,
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
              payloadJson: {
                companyId,
                companyName,
                activatedAt,
              },
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
              payloadJson: {
                companyId,
                companyName,
                activatedAt,
              },
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