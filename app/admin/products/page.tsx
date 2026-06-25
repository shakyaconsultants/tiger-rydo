import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { deleteProduct } from "@/lib/actions";
import { AdminHeader } from "@/components/admin/admin-header";
import { Button } from "@/components/ui/button";

export default async function AdminProductsPage() {
  const products = await prisma.product.findMany({ include: { productType: true }, orderBy: { updatedAt: "desc" } });
  return (
    <div>
      <AdminHeader title="Products" />
      <Button asChild className="mb-6"><Link href="/admin/products/new">Add Product</Link></Button>
      <div className="space-y-2">
        {products.map((p) => (
          <div key={p.id} className="flex items-center justify-between border bg-white p-4">
            <div><p className="font-medium">{p.name}</p><p className="text-sm text-gray-500">{p.productType.name} · {p.published ? "Published" : "Draft"}{p.featured ? " · Featured" : ""}</p></div>
            <div className="flex items-center gap-3">
              <Link href={`/admin/products/${p.id}/edit`} className="text-sm text-blue-600">Edit</Link>
              <form action={deleteProduct}>
                <input type="hidden" name="id" value={p.id} />
                <Button type="submit" variant="ghost" size="sm" className="text-red-600 hover:bg-red-50 hover:text-red-700">Delete</Button>
              </form>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
