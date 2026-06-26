import "dotenv/config";
import { PrismaClient } from "../app/generated/prisma";

async function main() {
  const prisma = new PrismaClient();
  const [users, products, settings] = await Promise.all([
    prisma.user.count(),
    prisma.product.count(),
    prisma.siteSettings.findUnique({ where: { id: "default" } }),
  ]);
  console.log(JSON.stringify({ users, products, siteName: settings?.siteName }, null, 2));
  await prisma.$disconnect();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
