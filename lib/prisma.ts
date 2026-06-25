import "dotenv/config";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import { PrismaClient } from "@/app/generated/prisma/client";
import { getDatabaseUrl, isTursoDatabase } from "@/lib/database";

function createPrismaClient() {
  const url = getDatabaseUrl();

  if (isTursoDatabase(url)) {
    const authToken = process.env.TURSO_AUTH_TOKEN;
    if (!authToken) {
      throw new Error("TURSO_AUTH_TOKEN is required when DATABASE_URL points to Turso.");
    }
    return new PrismaClient({
      adapter: new PrismaLibSql({ url, authToken }),
    });
  }

  return new PrismaClient({
    adapter: new PrismaBetterSqlite3({ url }),
  });
}

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
