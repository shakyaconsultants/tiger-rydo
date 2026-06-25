import { prisma } from "@/lib/prisma";
import { saveProduct } from "@/lib/actions";
import { AdminHeader } from "@/components/admin/admin-header";
import { ProductForm } from "@/components/admin/product-form";

export default async function NewProductPage() {
  const types = await prisma.productType.findMany({ orderBy: { sortOrder: "asc" } });
  return (
    <div>
      <AdminHeader title="Add Product" />
      <ProductForm types={types} action={saveProduct} />
    </div>
  );
}
