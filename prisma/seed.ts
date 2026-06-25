import "dotenv/config";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "../app/generated/prisma/client";
import bcrypt from "bcryptjs";

const adapter = new PrismaBetterSqlite3({ url: process.env.DATABASE_URL || "file:./dev.db" });
const prisma = new PrismaClient({ adapter });

const SCOOTY_SHOWCASE_VIDEO = "https://assets.mixkit.co/videos/15807/15807-720.mp4";

async function seedProductValues(
  productTypeId: string,
  params: { name: string; slug: string; fieldType: "TEXT" | "NUMBER" | "TEXTAREA" | "RICH_TEXT" | "SELECT" | "IMAGE" | "VIDEO" | "BOOLEAN" | "URL"; required?: boolean; options?: string }[],
  products: { name: string; slug: string; published?: boolean; featured?: boolean; sortOrder?: number; values: Record<string, string> }[],
) {
  for (const [i, p] of params.entries()) {
    await prisma.parameterDefinition.upsert({
      where: { productTypeId_slug: { productTypeId, slug: p.slug } },
      update: { name: p.name, fieldType: p.fieldType, sortOrder: i },
      create: { productTypeId, name: p.name, slug: p.slug, fieldType: p.fieldType, required: p.required ?? false, options: p.options, sortOrder: i },
    });
  }

  const defs = await prisma.parameterDefinition.findMany({ where: { productTypeId } });
  for (const p of products) {
    const product = await prisma.product.upsert({
      where: { slug: p.slug },
      update: { name: p.name, published: p.published ?? true, featured: p.featured ?? false, sortOrder: p.sortOrder ?? 0 },
      create: { name: p.name, slug: p.slug, productTypeId, published: p.published ?? true, featured: p.featured ?? false, sortOrder: p.sortOrder ?? 0 },
    });
    for (const d of defs) {
      const value = p.values[d.slug];
      if (value == null) continue;
      await prisma.parameterValue.upsert({
        where: { productId_parameterId: { productId: product.id, parameterId: d.id } },
        update: { value },
        create: { productId: product.id, parameterId: d.id, value },
      });
    }
  }
}

async function main() {
  const adminHash = await bcrypt.hash("admin123", 10);
  const dealerHash = await bcrypt.hash("dealer123", 10);

  await prisma.user.upsert({
    where: { email: "admin@tigerrydo.com" },
    update: { name: "Admin", role: "ADMIN" },
    create: { email: "admin@tigerrydo.com", passwordHash: adminHash, name: "Admin", role: "ADMIN" },
  });
  await prisma.user.upsert({
    where: { email: "dealer@tigerrydo.com" },
    update: { name: "Demo Dealer", role: "DEALER", phone: "9453605312" },
    create: { email: "dealer@tigerrydo.com", passwordHash: dealerHash, name: "Demo Dealer", role: "DEALER", phone: "9453605312" },
  });

  await prisma.siteSettings.upsert({
    where: { id: "default" },
    update: {},
    create: {
      id: "default",
      siteName: "TIGER RYDO",
      tagline: "RIDE BOLD. RIDE CLEAN. RIDE FUTURE.",
      logoUrl: "/brand/logo.svg",
      faviconUrl: "/brand/icon.svg",
      phone: "9453605312",
      customerWhatsapp: "9453605312",
      dealershipWhatsapp: "9453605312",
      address: "Lucknow, Uttar Pradesh, India",
      footerText: "© TIGER RYDO. Premium electric mobility.",
    },
  });

  const types = [
    { name: "Scooty", slug: "scooty" },
    { name: "Batteries", slug: "batteries" },
    { name: "Chargers", slug: "chargers" },
  ];
  for (const [i, t] of types.entries()) {
    await prisma.productType.upsert({ where: { slug: t.slug }, update: { name: t.name, sortOrder: i }, create: { ...t, sortOrder: i } });
  }

  const scooty = await prisma.productType.findUnique({ where: { slug: "scooty" } });
  if (scooty) {
    await seedProductValues(
      scooty.id,
      [
        { name: "Range", slug: "range", fieldType: "TEXT" },
        { name: "Top Speed", slug: "top-speed", fieldType: "TEXT" },
        { name: "Battery", slug: "battery", fieldType: "TEXT" },
        { name: "Motor", slug: "motor", fieldType: "TEXT" },
        { name: "Main Image", slug: "main-image", fieldType: "IMAGE" },
        { name: "Product Video", slug: "product-video", fieldType: "VIDEO" },
        { name: "Description", slug: "description", fieldType: "RICH_TEXT" },
      ],
      [
        {
          name: "Tiger E1",
          slug: "tiger-e1",
          published: true,
          featured: true,
          sortOrder: 0,
          values: {
            range: "120 km",
            "top-speed": "65 km/h",
            battery: "2.5 kWh Lithium",
            motor: "2500W BLDC",
            "main-image": "/brand/3A.png",
            "product-video": SCOOTY_SHOWCASE_VIDEO,
            description: "The Tiger E1 comes with next-gen technology that delivers exceptional power, efficiency, safety, and connectivity for today's urban riders.",
          },
        },
        {
          name: "Tiger E2",
          slug: "tiger-e2",
          published: true,
          featured: true,
          sortOrder: 1,
          values: {
            range: "150 km",
            "top-speed": "70 km/h",
            battery: "3.2 kWh Lithium",
            motor: "3000W BLDC",
            "main-image": "/seed/Grey-1-1.png",
            "product-video": SCOOTY_SHOWCASE_VIDEO,
            description: "Tiger E2 is built for longer city commutes with extended range and a sportier ride profile.",
          },
        },
      ],
    );
  }

  const batteries = await prisma.productType.findUnique({ where: { slug: "batteries" } });
  if (batteries) {
    await seedProductValues(
      batteries.id,
      [
        { name: "Capacity", slug: "capacity", fieldType: "TEXT" },
        { name: "Voltage", slug: "voltage", fieldType: "TEXT" },
        { name: "Type", slug: "type", fieldType: "TEXT" },
        { name: "Main Image", slug: "main-image", fieldType: "IMAGE" },
        { name: "Description", slug: "description", fieldType: "RICH_TEXT" },
      ],
      [
        {
          name: "Tiger Battery 2.5 kWh",
          slug: "tiger-battery-2-5",
          published: true,
          featured: false,
          sortOrder: 0,
          values: {
            capacity: "2.5 kWh",
            voltage: "60V",
            type: "Lithium-ion",
            "main-image": "/brand/images.jpg",
            description: "High-performance removable battery pack compatible with Tiger E-series scooters.",
          },
        },
        {
          name: "Tiger Battery 3.2 kWh",
          slug: "tiger-battery-3-2",
          published: true,
          featured: false,
          sortOrder: 1,
          values: {
            capacity: "3.2 kWh",
            voltage: "72V",
            type: "Lithium-ion",
            "main-image": "/brand/images.jpg",
            description: "Extended-range battery variant for riders who need more daily mileage.",
          },
        },
      ],
    );
  }

  const chargers = await prisma.productType.findUnique({ where: { slug: "chargers" } });
  if (chargers) {
    await seedProductValues(
      chargers.id,
      [
        { name: "Output Power", slug: "output-power", fieldType: "TEXT" },
        { name: "Connector", slug: "connector", fieldType: "TEXT" },
        { name: "Main Image", slug: "main-image", fieldType: "IMAGE" },
        { name: "Description", slug: "description", fieldType: "RICH_TEXT" },
      ],
      [
        {
          name: "Tiger Fast Charger",
          slug: "tiger-fast-charger",
          published: true,
          featured: false,
          sortOrder: 0,
          values: {
            "output-power": "800W",
            connector: "Standard Tiger Port",
            "main-image": "/brand/e-bike-electric-scooter-charger-72-volt-4-5amp-562.jpg",
            description: "Fast charger for quick turnaround at home or dealership service points.",
          },
        },
      ],
    );
  }

  await prisma.pageSection.upsert({
    where: { page_key: { page: "about", key: "intro" } },
    update: { content: JSON.stringify({ body: "Tiger builds intelligent electric vehicles for the city and beyond. Clean design. Intelligent performance. Zero compromise." }) },
    create: { page: "about", key: "intro", content: JSON.stringify({ body: "Tiger builds intelligent electric vehicles for the city and beyond. Clean design. Intelligent performance. Zero compromise." }) },
  });
  await prisma.pageSection.upsert({
    where: { page_key: { page: "about", key: "mission" } },
    update: { content: JSON.stringify({ body: "Our mission is to make clean urban mobility accessible, reliable, and exciting for every rider and dealer partner across India." }) },
    create: { page: "about", key: "mission", content: JSON.stringify({ body: "Our mission is to make clean urban mobility accessible, reliable, and exciting for every rider and dealer partner across India." }) },
  });

  await prisma.heroBanner.deleteMany();
  await prisma.heroBanner.createMany({
    data: [
      { title: "RIDE BOLD. RIDE CLEAN. RIDE FUTURE.", subtitle: "Premium electric scooters built for modern urban mobility.", imageUrl: "/brand/3A.png", sortOrder: 0 },
      { title: "POWER YOUR CITY RIDE", subtitle: "Explore scooties, batteries, and chargers from one trusted brand.", imageUrl: "/seed/Black-1.png", sortOrder: 1 },
    ],
  });

  await prisma.testimonial.deleteMany();
  await prisma.testimonial.createMany({
    data: [
      { name: "Rahul S.", role: "Daily Commuter", quote: "Smooth ride, sharp looks, and zero compromise on city runs.", imageUrl: "/seed/avatar.svg", sortOrder: 0 },
      { name: "Priya M.", role: "Urban Rider", quote: "Tiger E1 feels premium and agile - exactly what I wanted.", imageUrl: "/seed/avatar.svg", sortOrder: 1 },
      { name: "Amit K.", role: "Dealer Partner", quote: "Customers love the design and performance. Orders keep coming.", imageUrl: "/seed/avatar.svg", sortOrder: 2 },
    ],
  });

  const form = await prisma.formTemplate.upsert({
    where: { id: "default-form" },
    update: { name: "Dealer Order Form", active: true },
    create: { id: "default-form", name: "Dealer Order Form", active: true },
  });
  const fields = [
    { name: "Product Model", slug: "product-model", fieldType: "SELECT" as const, options: JSON.stringify(["Tiger E1", "Tiger E2", "Tiger Battery 2.5 kWh", "Tiger Battery 3.2 kWh", "Tiger Fast Charger"]), required: true },
    { name: "Quantity", slug: "quantity", fieldType: "NUMBER" as const, required: true },
    { name: "Delivery Address", slug: "delivery-address", fieldType: "TEXTAREA" as const, required: true },
    { name: "Notes", slug: "notes", fieldType: "TEXTAREA" as const, required: false },
  ];
  for (const [i, f] of fields.entries()) {
    await prisma.formFieldDefinition.upsert({
      where: { formTemplateId_slug: { formTemplateId: form.id, slug: f.slug } },
      update: { name: f.name, fieldType: f.fieldType, options: f.options, required: f.required, sortOrder: i },
      create: { formTemplateId: form.id, ...f, sortOrder: i },
    });
  }
}

main().then(() => prisma.$disconnect()).catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1); });
