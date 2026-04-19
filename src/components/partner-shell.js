import Link from "next/link";
import LogoutButton from "@/components/logout-button";

export default function PartnerShell({ partnerName, children }) {
  return (
    <div style={{ minHeight: "100vh", display: "grid", gridTemplateColumns: "240px 1fr" }}>
      <aside
        style={{
          background: "#ffffff",
          borderRight: "1px solid #e7e2d5",
          padding: "24px 18px",
          display: "grid",
          alignContent: "start",
          gap: "18px",
        }}
      >
        <div>
          <div style={{ fontSize: "24px", fontWeight: 800 }}>Punctoo Partner</div>
          <div style={{ color: "#666", marginTop: "6px" }}>{partnerName}</div>
        </div>

        <nav style={{ display: "grid", gap: "10px" }}>
          <Link href="/dashboard">Dashboard</Link>
          <Link href="/leads">Leads</Link>
          <Link href="/commissions">Commissies</Link>
        </nav>

        <div style={{ marginTop: "24px" }}>
          <LogoutButton />
        </div>
      </aside>

      <main style={{ padding: "28px" }}>{children}</main>
    </div>
  );
}