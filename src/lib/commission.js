import prisma from "@/lib/prisma";

export async function getActiveCommissionRule() {
  return prisma.commissionRule.findFirst({
    where: {
      active: true,
      OR: [
        { appliesUntil: null },
        { appliesUntil: { gte: new Date() } },
      ],
    },
    orderBy: {
      appliesFrom: "desc",
    },
  });
}

export function addMonths(date, months) {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return d;
}

export function isWithinEligibilityWindow(lead, activationDate) {
  const from = lead.commissionEligibleFrom ? new Date(lead.commissionEligibleFrom) : null;
  const until = lead.commissionEligibleUntil ? new Date(lead.commissionEligibleUntil) : null;
  const activatedAt = new Date(activationDate);

  if (from && activatedAt < from) return false;
  if (until && activatedAt > until) return false;

  return true;
}