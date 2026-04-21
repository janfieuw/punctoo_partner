export default function LeadsTable({ leads }) {
  function formatDate(value) {
    if (!value) return "-";
    return new Intl.DateTimeFormat("nl-BE", {
      dateStyle: "short",
      timeStyle: "short",
    }).format(new Date(value));
  }

  return (
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
            <th style={th}>Ondernemingsnummer</th>
            <th style={th}>Contactpersoon</th>
            <th style={th}>E-mail</th>
            <th style={th}>Status</th>
            <th style={th}>Test gestart</th>
            <th style={th}>Geactiveerd</th>
            <th style={th}>Recht tot</th>
          </tr>
        </thead>

        <tbody>
          {leads.map((lead) => (
            <tr key={lead.id}>
              <td style={td}>{lead.companyName}</td>
              <td style={td}>{lead.vatNumberRaw}</td>
              <td style={td}>{lead.contactName || "-"}</td>
              <td style={td}>{lead.contactEmail || "-"}</td>
              <td style={td}>{lead.status}</td>
              <td style={td}>{formatDate(lead.trialStartedAt)}</td>
              <td style={td}>{formatDate(lead.activatedAt)}</td>
              <td style={td}>{formatDate(lead.commissionEligibleUntil)}</td>
            </tr>
          ))}
        </tbody>
      </table>
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