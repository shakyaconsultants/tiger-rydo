import { prisma } from "@/lib/prisma";
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
