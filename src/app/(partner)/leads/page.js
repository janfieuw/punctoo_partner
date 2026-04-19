import prisma from "@/lib/prisma";
import { getPartnerSession } from "@/lib/auth";
import LeadForm from "@/components/lead-form";
import LeadsTable from "@/components/leads-table";

export const dynamic = "force-dynamic";

export default async function LeadsPage() {
  const session = await getPartnerSession();

  const leads = await prisma.partnerLead.findMany({
    where: { partnerId: session.partnerId },
    orderBy: { registeredAt: "desc" },
  });

  return (
    <div style={{ display: "grid", gap: "18px" }}>
      <div>
        <h1 style={{ margin: 0 }}>Leads</h1>
        <p style={{ color: "#666" }}>
          Voeg ondernemingen toe. Een ondernemingsnummer kan maar één keer bestaan.
        </p>
      </div>

      <LeadForm />
      <LeadsTable leads={leads} />
    </div>
  );
}