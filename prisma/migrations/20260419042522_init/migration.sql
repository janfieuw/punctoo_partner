-- CreateEnum
CREATE TYPE "PartnerLeadStatus" AS ENUM ('REGISTERED', 'TRIAL_STARTED', 'ACTIVATED', 'EXPIRED', 'REJECTED');

-- CreateEnum
CREATE TYPE "PartnerLeadEventType" AS ENUM ('LEAD_CREATED', 'DUPLICATE_REJECTED', 'MATCH_FOUND', 'TRIAL_STARTED', 'ACTIVATED', 'COMMISSION_CREATED', 'COMMISSION_EXPIRED', 'PAYOUT_REQUESTED', 'PAYOUT_PAID');

-- CreateEnum
CREATE TYPE "PartnerCommissionStatus" AS ENUM ('PENDING', 'EARNED', 'APPROVED', 'PAID', 'CANCELLED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "PartnerPayoutStatus" AS ENUM ('REQUESTED', 'APPROVED', 'PAID', 'REJECTED');

-- CreateTable
CREATE TABLE "Partner" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Partner_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PartnerLead" (
    "id" TEXT NOT NULL,
    "partnerId" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "vatNumberRaw" TEXT NOT NULL,
    "vatNumberNormalized" TEXT NOT NULL,
    "contactName" TEXT,
    "contactEmail" TEXT,
    "note" TEXT,
    "sourceLabel" TEXT,
    "status" "PartnerLeadStatus" NOT NULL DEFAULT 'REGISTERED',
    "registeredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "matchedCompanyId" TEXT,
    "matchedAt" TIMESTAMP(3),
    "trialStartedAt" TIMESTAMP(3),
    "activatedAt" TIMESTAMP(3),
    "commissionEligibleFrom" TIMESTAMP(3),
    "commissionEligibleUntil" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PartnerLead_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PartnerLeadEvent" (
    "id" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "type" "PartnerLeadEventType" NOT NULL,
    "message" TEXT,
    "payloadJson" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PartnerLeadEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CommissionRule" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "durationMonths" INTEGER,
    "commissionPercent" DECIMAL(5,2),
    "flatAmount" DECIMAL(10,2),
    "appliesFrom" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "appliesUntil" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CommissionRule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PartnerCommission" (
    "id" TEXT NOT NULL,
    "partnerId" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "companyId" TEXT,
    "status" "PartnerCommissionStatus" NOT NULL DEFAULT 'PENDING',
    "ruleNameSnapshot" TEXT NOT NULL,
    "percentSnapshot" DECIMAL(5,2),
    "amountSnapshot" DECIMAL(10,2),
    "eligibleFrom" TIMESTAMP(3) NOT NULL,
    "eligibleUntil" TIMESTAMP(3),
    "triggeredAt" TIMESTAMP(3),
    "approvedAt" TIMESTAMP(3),
    "paidAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PartnerCommission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PartnerPayout" (
    "id" TEXT NOT NULL,
    "partnerId" TEXT NOT NULL,
    "status" "PartnerPayoutStatus" NOT NULL DEFAULT 'REQUESTED',
    "referenceCode" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processedAt" TIMESTAMP(3),
    "note" TEXT,

    CONSTRAINT "PartnerPayout_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Partner_email_key" ON "Partner"("email");

-- CreateIndex
CREATE INDEX "Partner_active_idx" ON "Partner"("active");

-- CreateIndex
CREATE UNIQUE INDEX "PartnerLead_vatNumberNormalized_key" ON "PartnerLead"("vatNumberNormalized");

-- CreateIndex
CREATE INDEX "PartnerLead_partnerId_idx" ON "PartnerLead"("partnerId");

-- CreateIndex
CREATE INDEX "PartnerLead_status_idx" ON "PartnerLead"("status");

-- CreateIndex
CREATE INDEX "PartnerLead_matchedCompanyId_idx" ON "PartnerLead"("matchedCompanyId");

-- CreateIndex
CREATE INDEX "PartnerLead_registeredAt_idx" ON "PartnerLead"("registeredAt");

-- CreateIndex
CREATE INDEX "PartnerLeadEvent_leadId_createdAt_idx" ON "PartnerLeadEvent"("leadId", "createdAt");

-- CreateIndex
CREATE INDEX "CommissionRule_active_idx" ON "CommissionRule"("active");

-- CreateIndex
CREATE INDEX "PartnerCommission_partnerId_idx" ON "PartnerCommission"("partnerId");

-- CreateIndex
CREATE INDEX "PartnerCommission_leadId_idx" ON "PartnerCommission"("leadId");

-- CreateIndex
CREATE INDEX "PartnerCommission_companyId_idx" ON "PartnerCommission"("companyId");

-- CreateIndex
CREATE INDEX "PartnerCommission_status_idx" ON "PartnerCommission"("status");

-- CreateIndex
CREATE UNIQUE INDEX "PartnerPayout_referenceCode_key" ON "PartnerPayout"("referenceCode");

-- CreateIndex
CREATE INDEX "PartnerPayout_partnerId_idx" ON "PartnerPayout"("partnerId");

-- CreateIndex
CREATE INDEX "PartnerPayout_status_idx" ON "PartnerPayout"("status");

-- AddForeignKey
ALTER TABLE "PartnerLead" ADD CONSTRAINT "PartnerLead_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "Partner"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PartnerLeadEvent" ADD CONSTRAINT "PartnerLeadEvent_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "PartnerLead"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PartnerCommission" ADD CONSTRAINT "PartnerCommission_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "Partner"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PartnerCommission" ADD CONSTRAINT "PartnerCommission_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "PartnerLead"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PartnerPayout" ADD CONSTRAINT "PartnerPayout_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "Partner"("id") ON DELETE CASCADE ON UPDATE CASCADE;
