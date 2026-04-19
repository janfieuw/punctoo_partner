import { redirect } from "next/navigation";
import { getPartnerSession } from "@/lib/auth";
import PartnerShell from "@/components/partner-shell";

export default async function PartnerLayout({ children }) {
  const session = await getPartnerSession();

  if (!session) {
    redirect("/login");
  }

  return (
    <PartnerShell partnerName={session.partnerName}>
      {children}
    </PartnerShell>
  );
}