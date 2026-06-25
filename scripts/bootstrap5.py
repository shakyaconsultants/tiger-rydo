import os
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

def w(rel, content):
    path = os.path.join(ROOT, rel.replace("/", os.sep))
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w", encoding="utf-8", newline="\n") as f:
        f.write(content.rstrip() + "\n")
    print("w", rel)

w("lib/dynamic-form.tsx", '''"use client";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { parseJson } from "@/lib/utils";

export type DynamicField = {
  id: string;
  name: string;
  slug: string;
  fieldType: string;
  required: boolean;
  options?: string | null;
};

export function DynamicFormFields({ fields, prefix = "" }: { fields: DynamicField[]; prefix?: string }) {
  return (
    <div className="space-y-4">
      {fields.map((field) => {
        const name = `${prefix}${field.slug}`;
        const options = parseJson<string[]>(field.options, []);
        return (
          <div key={field.id}>
            <Label htmlFor={name}>{field.name}{field.required ? " *" : ""}</Label>
            {field.fieldType === "TEXTAREA" || field.fieldType === "RICH_TEXT" ? (
              <Textarea id={name} name={name} required={field.required} className="mt-1" />
            ) : field.fieldType === "SELECT" ? (
              <select id={name} name={name} required={field.required} className="mt-1 flex h-10 w-full border border-brand-lightGrey bg-white px-3 text-sm">
                <option value="">Select...</option>
                {options.map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
            ) : field.fieldType === "BOOLEAN" ? (
              <input id={name} name={name} type="checkbox" className="mt-2" />
            ) : field.fieldType === "IMAGE" || field.fieldType === "VIDEO" ? (
              <Input id={name} name={name} type="file" accept={field.fieldType === "VIDEO" ? "video/*" : "image/*"} required={field.required} className="mt-1" />
            ) : (
              <Input id={name} name={name} type={field.fieldType === "NUMBER" ? "number" : field.fieldType === "URL" ? "url" : "text"} required={field.required} className="mt-1" />
            )}
          </div>
        );
      })}
    </div>
  );
}
''')

w("components/public/product-card.tsx", '''import Link from "next/link";
import Image from "next/image";

export function ProductCard({ slug, name, imageUrl, specs }: { slug: string; name: string; imageUrl?: string; specs: string[] }) {
  return (
    <Link href={`/products/${slug}`} className="group block border border-brand-lightGrey bg-white transition hover:border-brand-accent">
      <div className="aspect-[4/3] bg-brand-lightGrey">
        {imageUrl ? (
          <Image src={imageUrl} alt={name} width={600} height={450} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center text-brand-muted">No image</div>
        )}
      </div>
      <div className="p-5">
        <h3 className="brand-heading text-lg group-hover:text-brand-accent">{name}</h3>
        <ul className="mt-3 space-y-1 text-sm text-brand-muted">
          {specs.filter(Boolean).slice(0, 3).map((s) => <li key={s}>{s}</li>)}
        </ul>
      </div>
    </Link>
  );
}
''')

w("app/(public)/page.tsx", '''import Link from "next/link";
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
''')

print("bootstrap5 done")