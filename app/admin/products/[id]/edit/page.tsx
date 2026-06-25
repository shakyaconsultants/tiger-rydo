import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { deleteProduct, saveProduct } from "@/lib/actions";
import { AdminHeader } from "@/components/admin/admin-header";
import { ProductForm } from "@/components/admin/product-form";
import { Button } from "@/components/ui/button";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await prisma.product.findUnique({ where: { id }, include: { values: true } });
  if (!product) notFound();
  const types = await prisma.productType.findMany({ orderBy: { sortOrder: "asc" } });
  const parameters = await prisma.parameterDefinition.findMany({ where: { productTypeId: product.productTypeId }, orderBy: { sortOrder: "asc" } });
  return (
    <div>
      <AdminHeader title={`Edit: ${product.name}`} />
      <ProductForm types={types} parameters={parameters} product={product} action={saveProduct} />
      <form action={deleteProduct} className="mt-8 max-w-2xl border-t pt-6">
        <input type="hidden" name="id" value={product.id} />
        <Button type="submit" variant="ghost" className="text-red-600 hover:bg-red-50 hover:text-red-700">Delete Product</Button>
      </form>
    </div>
  );
}
