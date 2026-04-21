import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// tijdelijke vaste partner (seed)
const PARTNER_EMAIL = "jan@punctoo.be";

export default async function DashboardPage() {
  const partner = await prisma.partner.findUnique({
    where: { email: PARTNER_EMAIL },
  });

  const partnerId = partner?.id;

  const [totalLeads, trialStarted, activated, earnedCommissions] = await Promise.all([
    prisma.partnerLead.count({
      where: { partnerId },
    }),
    prisma.partnerLead.count({
      where: { partnerId, status: "TRIAL_STARTED" },
    }),
    prisma.partnerLead.count({
      where: { partnerId, status: "ACTIVATED" },
    }),
    prisma.partnerCommission.count({
      where: { partnerId, status: "EARNED" },
    }),
  ]);

  const cards = [
    { label: "Leads", value: totalLeads },
    { label: "Test gestart", value: trialStarted },
    { label: "Geactiveerd", value: activated },
    { label: "Commissies verdiend", value: earnedCommissions },
  ];

  return (
    <div style={{ display: "grid", gap: "18px" }}>
      <div>
        <h1 style={{ margin: 0 }}>Dashboard</h1>
        <p style={{ color: "#666" }}>Overzicht van jouw aangebrachte ondernemingen.</p>
      </div>

      <div
        style={{
          display: "grid",
          gap: "16px",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
        }}
      >
        {cards.map((card) => (
          <div
            key={card.label}
            style={{
              background: "#fff",
              border: "1px solid #e7e2d5",
              borderRadius: "18px",
              padding: "18px",
            }}
          >
            <div style={{ color: "#666", marginBottom: "8px" }}>{card.label}</div>
            <div style={{ fontSize: "34px", fontWeight: 800 }}>{card.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}