import os
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

def w(rel, content):
    path = os.path.join(ROOT, rel.replace("/", os.sep))
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w", encoding="utf-8", newline="\n") as f:
        f.write(content.rstrip() + "\n")
    print("w", rel)

w("public/brand/icon.svg", '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none">
  <rect width="100" height="100" rx="24" fill="#0A0A0B"/>
  <g transform="translate(22, 20)">
    <path d="M0 0L35 30L0 60H20L55 30L20 0H0Z" fill="#FF5500"/>
    <path d="M22 0L57 30L22 60H42L77 30L42 0H22Z" fill="#F5F5F7"/>
  </g>
</svg>''')

w("public/brand/logo.svg", '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 48" fill="none">
  <text x="0" y="36" fill="#0A0A0B" font-family="Space Grotesk, Arial Black, sans-serif" font-size="34" font-weight="700" font-style="italic">TIGER</text>
  <path d="M120 8 C150 8 170 18 185 24 C170 30 150 40 120 40" stroke="#FF5500" stroke-width="6" fill="none"/>
  <circle cx="188" cy="24" r="10" stroke="#FF5500" stroke-width="5" fill="none"/>
</svg>''')

w("prisma/seed.ts", '''import { PrismaClient } from "../app/generated/prisma";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const adminHash = await bcrypt.hash("admin123", 10);
  const dealerHash = await bcrypt.hash("dealer123", 10);

  await prisma.user.upsert({
    where: { email: "admin@tigerrydo.com" },
    update: {},
    create: { email: "admin@tigerrydo.com", passwordHash: adminHash, name: "Admin", role: "ADMIN" },
  });
  await prisma.user.upsert({
    where: { email: "dealer@tigerrydo.com" },
    update: {},
    create: { email: "dealer@tigerrydo.com", passwordHash: dealerHash, name: "Demo Dealer", role: "DEALER", phone: "9453605312" },
  });

  await prisma.siteSettings.upsert({
    where: { id: "default" },
    update: {},
    create: { id: "default" },
  });

  const types = [
    { name: "Scooty", slug: "scooty" },
    { name: "Batteries", slug: "batteries" },
    { name: "Chargers", slug: "chargers" },
  ];
  for (const [i, t] of types.entries()) {
    await prisma.productType.upsert({ where: { slug: t.slug }, update: {}, create: { ...t, sortOrder: i } });
  }

  const scooty = await prisma.productType.findUnique({ where: { slug: "scooty" } });
  if (scooty) {
    const params = [
      { name: "Range", slug: "range", fieldType: "TEXT" as const },
      { name: "Top Speed", slug: "top-speed", fieldType: "TEXT" as const },
      { name: "Battery", slug: "battery", fieldType: "TEXT" as const },
      { name: "Motor", slug: "motor", fieldType: "TEXT" as const },
      { name: "Main Image", slug: "main-image", fieldType: "IMAGE" as const },
      { name: "Description", slug: "description", fieldType: "RICH_TEXT" as const },
    ];
    for (const [i, p] of params.entries()) {
      await prisma.parameterDefinition.upsert({
        where: { productTypeId_slug: { productTypeId: scooty.id, slug: p.slug } },
        update: {},
        create: { productTypeId: scooty.id, ...p, sortOrder: i },
      });
    }

    const defs = await prisma.parameterDefinition.findMany({ where: { productTypeId: scooty.id } });
    const product = await prisma.product.upsert({
      where: { slug: "tiger-e1" },
      update: { published: true, featured: true },
      create: { name: "Tiger E1", slug: "tiger-e1", productTypeId: scooty.id, published: true, featured: true },
    });
    const values: Record<string, string> = {
      range: "120 km",
      "top-speed": "65 km/h",
      battery: "2.5 kWh Lithium",
      motor: "2500W BLDC",
      description: "The Tiger E1 comes with next-gen technology that delivers exceptional power, efficiency, safety, and connectivity for today\u2019s urban riders.",
    };
    for (const d of defs) {
      if (values[d.slug]) {
        await prisma.parameterValue.upsert({
          where: { productId_parameterId: { productId: product.id, parameterId: d.id } },
          update: { value: values[d.slug] },
          create: { productId: product.id, parameterId: d.id, value: values[d.slug] },
        });
      }
    }
  }

  await prisma.pageSection.upsert({
    where: { page_key: { page: "about", key: "intro" } },
    update: {},
    create: { page: "about", key: "intro", content: JSON.stringify({ body: "Tiger builds intelligent electric vehicles for the city and beyond. Clean design. Intelligent performance. Zero compromise." }) },
  });

  await prisma.heroBanner.deleteMany();
  await prisma.heroBanner.create({
    data: { title: "RIDE BOLD. RIDE CLEAN. RIDE FUTURE.", subtitle: "Premium electric scooters built for modern urban mobility.", imageUrl: "/brand/hero-placeholder.svg", sortOrder: 0 },
  });

  await prisma.testimonial.deleteMany();
  await prisma.testimonial.createMany({
    data: [
      { name: "Rahul S.", role: "Daily Commuter", quote: "Smooth ride, sharp looks, and zero compromise on city runs." },
      { name: "Priya M.", role: "Urban Rider", quote: "Tiger E1 feels premium and agile — exactly what I wanted." },
      { name: "Amit K.", role: "Dealer Partner", quote: "Customers love the design and performance. Orders keep coming." },
    ],
  });

  const form = await prisma.formTemplate.upsert({
    where: { id: "default-form" },
    update: {},
    create: { id: "default-form", name: "Dealer Order Form", active: true },
  });
  const fields = [
    { name: "Product Model", slug: "product-model", fieldType: "SELECT" as const, options: JSON.stringify(["Tiger E1", "Battery Pack", "Fast Charger"]), required: true },
    { name: "Quantity", slug: "quantity", fieldType: "NUMBER" as const, required: true },
    { name: "Delivery Address", slug: "delivery-address", fieldType: "TEXTAREA" as const, required: true },
    { name: "Notes", slug: "notes", fieldType: "TEXTAREA" as const, required: false },
  ];
  for (const [i, f] of fields.entries()) {
    await prisma.formFieldDefinition.upsert({
      where: { formTemplateId_slug: { formTemplateId: form.id, slug: f.slug } },
      update: {},
      create: { formTemplateId: form.id, ...f, sortOrder: i },
    });
  }
}

main().then(() => prisma.$disconnect()).catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1); });
''')

w("public/brand/hero-placeholder.svg", '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" fill="none">
  <rect width="800" height="600" fill="#1C1C1E"/>
  <path d="M120 420 L280 300 L420 360 L620 240 L760 300" stroke="#FF5500" stroke-width="8" fill="none"/>
  <circle cx="620" cy="380" r="70" stroke="#FF5500" stroke-width="10" fill="none"/>
  <text x="80" y="120" fill="#F5F5F7" font-family="Arial" font-size="42" font-weight="700">TIGER E1</text>
</svg>''')

w("components/providers.tsx", '''"use client";
import { SessionProvider } from "next-auth/react";

export function Providers({ children }: { children: React.ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}
''')

print("bootstrap12 done")