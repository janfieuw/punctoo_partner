const bcrypt = require("bcryptjs");
const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");
const { Pool } = require("pg");
require("dotenv").config();

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not set");
  }

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  const prisma = new PrismaClient({
    adapter: new PrismaPg(pool),
  });

  const passwordHash = await bcrypt.hash("test123", 10);

  const partner = await prisma.partner.upsert({
    where: { email: "jan@punctoo.be" },
    update: {
      name: "Jan Fieuw",
      active: true,
      passwordHash,
    },
    create: {
      name: "Jan Fieuw",
      email: "jan@punctoo.be",
      active: true,
      passwordHash,
    },
  });

  await prisma.commissionRule.upsert({
    where: { id: "default-commission-rule" },
    update: {},
    create: {
      id: "default-commission-rule",
      name: "Default 25%",
      active: true,
      durationMonths: 36,
      commissionPercent: "25.00",
    },
  });

  console.log("Seed OK");
  console.log({
    email: "jan@punctoo.be",
    password: "test123",
    partnerId: partner.id,
  });

  await prisma.$disconnect();
  await pool.end();
}

main().catch((error) => {
  console.error("Seed failed:", error);
  process.exit(1);
});