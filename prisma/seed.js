/** Seeds the 22-branch demo network, its service catalogues, and the demo staff/admin accounts. */
import { PrismaClient } from "@prisma/client";
import { seedBranches, seedUsers } from "../app/lib/server/demoData.js";

const prisma = new PrismaClient();

async function main() {
  await seedBranches(prisma);
  await seedUsers(prisma);

  const branchCount = await prisma.branch.count();
  const serviceCount = await prisma.branchService.count();
  const userCount = await prisma.user.count();
  console.log(`Seeded ${branchCount} branches, ${serviceCount} services, ${userCount} demo accounts.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
