import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { getSiteSettings } from "@/lib/settings";
import { whatsappUrl, parseJson } from "@/lib/utils";
import { ProductCard } from "@/components/public/product-card";

export default async function HomePage() {
  const settings = await getSiteSettings();
  const [heroes, testimonials, featured] = await Promise.all([
    prisma.heroBanner.findMany({ where: { enabled: true }, orderBy: { sortOrder: "asc" } }),
    prisma.testimonial.findMany({ where: { enabled: true }, orderBy: { sortOrder: "asc" }, take: 6 }),
    prisma.product.findMany({ where: { published: true, featured: true }, include: { values: { include: { parameter: true } }, productType: true }, orderBy: { sortOrder: "asc" }, take: 6 }),
  ]);
  const hero = heroes[0];

  function getSpec(product: (typeof featured)[0], slugs: string[]) {
    for (const slug of slugs) {
      const v = product.values.find((x) => x.parameter.slug === slug);
      if (v?.value) return `${v.parameter.name}: ${v.value}`;
    }
    return "";
  }
  function getImage(product: (typeof featured)[0]) {
    return product.values.find((v) => v.parameter.fieldType === "IMAGE")?.value;
  }

  return (
    <div>
      <section className="relative bg-brand-primary text-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-20 md:grid-cols-2 md:items-center">
          <div>
            <p className="text-brand-accent text-sm font-semibold tracking-widest">{settings.siteName}</p>
            <h1 className="brand-heading mt-4 text-4xl md:text-6xl">{hero?.title || settings.tagline}</h1>
            <p className="mt-6 max-w-lg text-white/80">{hero?.subtitle || "Intelligent electric vehicles designed for real adventures."}</p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link href="/products" className="bg-brand-accent px-6 py-3 text-sm font-semibold hover:bg-orange-600">Explore Products</Link>
              <Link href={whatsappUrl(settings.dealershipWhatsapp, settings.dealershipWhatsappMsg)} target="_blank" className="border border-white px-6 py-3 text-sm font-semibold hover:bg-white hover:text-brand-primary">Looking for Dealership?</Link>
            </div>
          </div>
          <div className="relative aspect-[4/3] overflow-hidden bg-brand-darkGrey">
            {hero?.imageUrl && <Image src={hero.imageUrl} alt={hero.title} fill className="object-cover" />}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16">
        <div className="mb-8 flex items-end justify-between">
          <h2 className="brand-heading text-3xl">Featured Scooties</h2>
          <Link href="/products" className="text-sm font-medium text-brand-accent">View all</Link>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((p) => (
            <ProductCard key={p.id} slug={p.slug} name={p.name} imageUrl={getImage(p)} specs={[getSpec(p, ["range", "top-speed", "battery"]), getSpec(p, ["motor", "charging-time"])]} />
          ))}
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="mx-auto max-w-7xl px-4">
          <h2 className="brand-heading text-3xl">Rider Stories</h2>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {testimonials.map((t) => (
              <blockquote key={t.id} className="border border-brand-lightGrey p-6">
                <p className="text-brand-muted">"{t.quote}"</p>
                <footer className="mt-4 text-sm font-semibold">{t.name}{t.role ? ` · ${t.role}` : ""}</footer>
              </blockquote>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-brand-darkGrey px-4 py-16 text-white">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 md:flex-row md:items-center">
          <div>
            <h2 className="brand-heading text-3xl">Looking for Dealership?</h2>
            <p className="mt-2 text-white/70">Partner with TIGER RYDO and bring premium electric mobility to your city.</p>
          </div>
          <Link href={whatsappUrl(settings.dealershipWhatsapp, settings.dealershipWhatsappMsg)} target="_blank" className="bg-brand-accent px-6 py-3 text-sm font-semibold hover:bg-orange-600">Contact on WhatsApp</Link>
        </div>
      </section>
    </div>
  );
}
