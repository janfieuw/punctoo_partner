import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function jsonOk(data = {}, status = 200) {
  return NextResponse.json({ ok: true, ...data }, { status });
}

function jsonError(error, status = 400) {
  return NextResponse.json(
    { ok: false, error: error instanceof Error ? error.message : String(error) },
    { status }
  );
}

export async function POST(req) {
  try {
    const secret = req.headers.get("x-internal-secret");

    if (!process.env.PARTNER_SYNC_SECRET) {
      return jsonError("PARTNER_SYNC_SECRET ontbreekt", 500);
    }

    if (secret !== process.env.PARTNER_SYNC_SECRET) {
      return jsonError("Niet toegestaan", 401);
    }

    const body = await req.json();

    const {
      companyId,
      companyName,
      vatNumber,
      trialStartsAt,
      activatedAt,
    } = body;

    if (!vatNumber) {
      return jsonError("BTW-nummer ontbreekt", 400);
    }

    // 🔍 Zoek lead op BTW-nummer
    const lead = await prisma.lead.findFirst({
      where: {
        vatNumber: vatNumber,
      },
    });

    if (!lead) {
      return jsonOk({
        message: "Geen match gevonden in partnerapp",
      });
    }

    // 🎯 Bepaal status
    let newStatus = lead.status;

    if (activatedAt) {
      newStatus = "ACTIVE";
    } else if (trialStartsAt) {
      newStatus = "TRIAL";
    }

    // 🔥 Update lead
    const updatedLead = await prisma.lead.update({
      where: { id: lead.id },
      data: {
        status: newStatus,
        mypunctooCompanyId: companyId,
        trialStartedAt: trialStartsAt || lead.trialStartedAt,
        activatedAt: activatedAt || lead.activatedAt,
        companyName: companyName || lead.companyName,
      },
    });

    return jsonOk({
      message: "Lead succesvol gesynchroniseerd",
      lead: updatedLead,
    });
  } catch (error) {
    console.error("mypunctoo-sync error:", error);
    return jsonError("Synchronisatie mislukt", 500);
  }
}