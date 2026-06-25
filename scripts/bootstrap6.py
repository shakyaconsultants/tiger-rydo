import os
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

def w(rel, content):
    path = os.path.join(ROOT, rel.replace("/", os.sep))
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w", encoding="utf-8", newline="\n") as f:
        f.write(content.rstrip() + "\n")
    print("w", rel)

w("app/(public)/products/page.tsx", '''import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ProductCard } from "@/components/public/product-card";

export default async function ProductsPage({ searchParams }: { searchParams: Promise<{ type?: string }> }) {
  const { type } = await searchParams;
  const types = await prisma.productType.findMany({ orderBy: { sortOrder: "asc" } });
  const activeSlug = type || types[0]?.slug;
  const activeType = types.find((t) => t.slug === activeSlug) || types[0];
  const products = activeType
    ? await prisma.product.findMany({
        where: { published: true, productTypeId: activeType.id },
        include: { values: { include: { parameter: true } } },
        orderBy: { sortOrder: "asc" },
      })
    : [];

  function getSpec(p: (typeof products)[0], slug: string) {
    const v = p.values.find((x) => x.parameter.slug === slug);
    return v?.value ? `${v.parameter.name}: ${v.value}` : "";
  }
  function getImage(p: (typeof products)[0]) {
    return p.values.find((v) => v.parameter.fieldType === "IMAGE")?.value;
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      <h1 className="brand-heading text-4xl">Products</h1>
      <p className="mt-2 text-brand-muted">Scooties, batteries, chargers and more.</p>
      <div className="mt-8 flex flex-wrap gap-2">
        {types.map((t) => (
          <Link key={t.id} href={`/products?type=${t.slug}`} className={`px-4 py-2 text-sm font-medium ${activeType?.slug === t.slug ? "bg-brand-accent text-white" : "border border-brand-lightGrey bg-white"}`}>
            {t.name}
          </Link>
        ))}
      </div>
      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((p) => (
          <ProductCard key={p.id} slug={p.slug} name={p.name} imageUrl={getImage(p)} specs={[getSpec(p, "range"), getSpec(p, "top-speed"), getSpec(p, "battery")]} />
        ))}
      </div>
      {!products.length && <p className="mt-10 text-brand-muted">No products in this category yet.</p>}
    </div>
  );
}
''')

w("app/(public)/products/[slug]/page.tsx", '''import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await prisma.product.findFirst({
    where: { slug, published: true },
    include: { productType: true, values: { include: { parameter: true } } },
  });
  if (!product) notFound();

  const image = product.values.find((v) => v.parameter.fieldType === "IMAGE")?.value;
  const video = product.values.find((v) => v.parameter.fieldType === "VIDEO")?.value;
  const specs = product.values.filter((v) => !["IMAGE", "VIDEO", "RICH_TEXT"].includes(v.parameter.fieldType));
  const description = product.values.find((v) => v.parameter.fieldType === "RICH_TEXT" || v.parameter.slug === "description")?.value;

  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      <Link href="/products" className="text-sm text-brand-accent">← Back to products</Link>
      <div className="mt-6 grid gap-10 lg:grid-cols-2">
        <div className="space-y-4">
          <div className="aspect-[4/3] bg-brand-lightGrey">
            {image && <Image src={image} alt={product.name} width={800} height={600} className="h-full w-full object-cover" />}
          </div>
          {video && (
            <video src={video} controls className="w-full border border-brand-lightGrey" />
          )}
        </div>
        <div>
          <p className="text-sm text-brand-accent">{product.productType.name}</p>
          <h1 className="brand-heading mt-2 text-4xl">{product.name}</h1>
          {description && <p className="mt-6 text-brand-muted whitespace-pre-wrap">{description}</p>}
          <dl className="mt-8 space-y-3 border-t border-brand-lightGrey pt-6">
            {specs.map((s) => (
              <div key={s.id} className="flex justify-between gap-4 text-sm">
                <dt className="text-brand-muted">{s.parameter.name}</dt>
                <dd className="font-medium text-right">{s.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </div>
  );
}
''')

w("app/(public)/about/page.tsx", '''import { prisma } from "@/lib/prisma";
import { parseJson } from "@/lib/utils";

export default async function AboutPage() {
  const sections = await prisma.pageSection.findMany({ where: { page: "about", enabled: true }, orderBy: { sortOrder: "asc" } });
  const intro = sections.find((s) => s.key === "intro");
  const mission = sections.find((s) => s.key === "mission");
  const introContent = parseJson<{ body?: string }>(intro?.content, {});
  const missionContent = parseJson<{ body?: string }>(mission?.content, {});

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="brand-heading text-4xl">About TIGER RYDO</h1>
      <section className="mt-8 space-y-6 text-lg text-brand-muted">
        <p>{introContent.body || "Tiger builds intelligent electric vehicles for the city and beyond. Clean design. Intelligent performance. Zero compromise."}</p>
        {missionContent.body && <p>{missionContent.body}</p>}
      </section>
    </div>
  );
}
''')

w("app/(public)/contact/page.tsx", '''import { redirect } from "next/navigation";
import { getSiteSettings } from "@/lib/settings";
import { whatsappUrl } from "@/lib/utils";

export default async function ContactPage() {
  const settings = await getSiteSettings();
  redirect(whatsappUrl(settings.customerWhatsapp, settings.customerWhatsappMsg));
}
''')

print("bootstrap6 done")