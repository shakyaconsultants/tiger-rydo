import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { createProductType } from "@/lib/actions";
import { AdminHeader } from "@/components/admin/admin-header";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default async function ProductTypesPage() {
  const types = await prisma.productType.findMany({ include: { _count: { select: { products: true, parameters: true } } }, orderBy: { sortOrder: "asc" } });
  return (
    <div>
      <AdminHeader title="Product Types" />
      <form action={createProductType} className="mb-8 flex gap-2"><Input name="name" placeholder="New type name e.g. Scooty" required /><Button type="submit">Add Type</Button></form>
      <div className="space-y-3">
        {types.map((t) => (
          <div key={t.id} className="flex items-center justify-between border bg-white p-4">
            <div><p className="font-medium">{t.name}</p><p className="text-sm text-gray-500">{t._count.parameters} params · {t._count.products} products</p></div>
            <Link href={`/admin/product-types/${t.id}/parameters`} className="text-sm text-blue-600">Manage Parameters</Link>
          </div>
        ))}
      </div>
    </div>
  );
}
