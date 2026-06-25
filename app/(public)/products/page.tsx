import Link from "next/link";
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
