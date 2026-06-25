import os
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

def w(rel, content):
    path = os.path.join(ROOT, rel.replace("/", os.sep))
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w", encoding="utf-8", newline="\n") as f:
        f.write(content.rstrip() + "\n")
    print("w", rel)

pages = {
"app/admin/settings/page.tsx": '''import { getSiteSettings } from "@/lib/settings";
import { updateSiteSettings } from "@/lib/actions";
import { AdminHeader } from "@/components/admin/admin-header";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default async function SettingsPage() {
  const s = await getSiteSettings();
  return (
    <div>
      <AdminHeader title="Site Settings" />
      <form action={updateSiteSettings} className="max-w-2xl space-y-4">
        {[
          ["siteName", "Site Name", s.siteName],
          ["tagline", "Tagline", s.tagline],
          ["phone", "Phone", s.phone],
          ["customerWhatsapp", "Customer WhatsApp", s.customerWhatsapp],
          ["dealershipWhatsapp", "Dealership WhatsApp", s.dealershipWhatsapp],
          ["customerWhatsappMsg", "Customer WhatsApp Message", s.customerWhatsappMsg],
          ["dealershipWhatsappMsg", "Dealership WhatsApp Message", s.dealershipWhatsappMsg],
          ["address", "Address", s.address || ""],
        ].map(([name, label, value]) => (
          <div key={name}><Label>{label}</Label><Input name={name} defaultValue={value} className="mt-1" /></div>
        ))}
        <div><Label>Footer Text</Label><Textarea name="footerText" defaultValue={s.footerText || ""} className="mt-1" /></div>
        <Button type="submit">Save Settings</Button>
      </form>
    </div>
  );
}
''',

"app/admin/product-types/page.tsx": '''import Link from "next/link";
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
''',

"app/admin/product-types/[id]/parameters/page.tsx": '''import { prisma } from "@/lib/prisma";
import { createParameter } from "@/lib/actions";
import { AdminHeader } from "@/components/admin/admin-header";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

const fieldTypes = ["TEXT","NUMBER","TEXTAREA","RICH_TEXT","SELECT","IMAGE","VIDEO","BOOLEAN","URL"];

export default async function ParametersPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const type = await prisma.productType.findUnique({ where: { id }, include: { parameters: { orderBy: { sortOrder: "asc" } } } });
  if (!type) return <p>Not found</p>;
  return (
    <div>
      <AdminHeader title={`Parameters: ${type.name}`} />
      <form action={createParameter} className="mb-8 grid max-w-2xl gap-3 border bg-white p-4">
        <input type="hidden" name="productTypeId" value={id} />
        <div><Label>Name</Label><Input name="name" required className="mt-1" /></div>
        <div><Label>Field Type</Label><select name="fieldType" className="mt-1 h-10 w-full border px-3">{fieldTypes.map((f) => <option key={f}>{f}</option>)}</select></div>
        <div><Label>Options (comma-separated for SELECT)</Label><Input name="options" className="mt-1" /></div>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="required" /> Required</label>
        <Button type="submit">Add Parameter</Button>
      </form>
      <ul className="space-y-2">{type.parameters.map((p) => <li key={p.id} className="border bg-white p-3 text-sm">{p.name} · {p.fieldType}{p.required ? " · required" : ""}</li>)}</ul>
    </div>
  );
}
''',

"app/admin/products/page.tsx": '''import Link from "next/link";
import { prisma } from "@/lib/prisma";
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
            <Link href={`/admin/products/${p.id}/edit`} className="text-sm text-blue-600">Edit</Link>
          </div>
        ))}
      </div>
    </div>
  );
}
''',
}

for rel, content in pages.items():
    w(rel, content)

print("bootstrap9 done")