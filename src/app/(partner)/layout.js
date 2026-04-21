import PartnerShell from "@/components/partner-shell";

export default function PartnerLayout({ children }) {
  return (
    <PartnerShell partnerName="Jan Fieuw">
      {children}
    </PartnerShell>
  );
}