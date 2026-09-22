import { PrismaClient } from "@prisma/client";

// One Prisma instance per process; survive route-module reloads in dev.
const globalForPrisma = globalThis;

export const db = globalForPrisma.__queuelessPrisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.__queuelessPrisma = db;
}
