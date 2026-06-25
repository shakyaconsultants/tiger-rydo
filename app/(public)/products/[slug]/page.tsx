import Image from "next/image";
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
