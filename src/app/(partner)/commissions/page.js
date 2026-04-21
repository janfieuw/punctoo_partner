import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const PARTNER_EMAIL = "jan@punctoo.be";

function formatDate(value) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("nl-BE", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}

export default async function CommissionsPage() {
  const partner = await prisma.partner.findUnique({
    where: { email: PARTNER_EMAIL },
  });

  const commissions = await prisma.partnerCommission.findMany({
    where: { partnerId: partner?.id },
    orderBy: { createdAt: "desc" },
    include: {
      lead: true,
    },
  });

  return (
    <div style={{ display: "grid", gap: "18px" }}>
      <div>
        <h1 style={{ margin: 0 }}>Commissies</h1>
        <p style={{ color: "#666" }}>Overzicht van verdiende en uitbetaalde commissies.</p>
      </div>

      <div
        style={{
          background: "#fff",
          border: "1px solid #e7e2d5",
          borderRadius: "18px",
          overflow: "hidden",
        }}
      >
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead style={{ background: "#0c4e5f", color: "#fff" }}>
            <tr>
              <th style={th}>Onderneming</th>
              <th style={th}>Status</th>
              <th style={th}>Regel</th>
              <th style={th}>% / bedrag</th>
              <th style={th}>Getriggerd op</th>
              <th style={th}>Betaald op</th>
            </tr>
          </thead>
          <tbody>
            {commissions.map((item) => (
              <tr key={item.id}>
                <td style={td}>{item.lead?.companyName || "-"}</td>
                <td style={td}>{item.status}</td>
                <td style={td}>{item.ruleNameSnapshot}</td>
                <td style={td}>
                  {item.percentSnapshot
                    ? `${item.percentSnapshot}%`
                    : item.amountSnapshot
                    ? `€ ${item.amountSnapshot}`
                    : "-"}
                </td>
                <td style={td}>{formatDate(item.triggeredAt)}</td>
                <td style={td}>{formatDate(item.paidAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const th = {
  textAlign: "left",
  padding: "12px 14px",
  fontSize: "14px",
};

const td = {
  padding: "12px 14px",
  borderTop: "1px solid #eee7d8",
  fontSize: "14px",
};