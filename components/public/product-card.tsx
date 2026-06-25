import Link from "next/link";
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
