import { prisma } from "@/lib/prisma";
import { saveFormField } from "@/lib/actions";
import { AdminHeader } from "@/components/admin/admin-header";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

const fieldTypes = ["TEXT","NUMBER","TEXTAREA","SELECT","BOOLEAN"];

export default async function FormBuilderPage() {
  const template = await prisma.formTemplate.findFirst({ where: { active: true }, include: { fields: { orderBy: { sortOrder: "asc" } } } });
  return (
    <div>
      <AdminHeader title="Dealer Order Form Builder" />
      <p className="mb-4 text-sm text-gray-600">Define the fields dealers fill when placing orders.</p>
      <form action={saveFormField} className="mb-8 grid max-w-2xl gap-3 border bg-white p-4">
        <div><Label>Field Name</Label><Input name="name" required className="mt-1" /></div>
        <div><Label>Field Type</Label><select name="fieldType" className="mt-1 h-10 w-full border px-3">{fieldTypes.map((f) => <option key={f}>{f}</option>)}</select></div>
        <div><Label>Options (comma-separated for SELECT)</Label><Input name="options" className="mt-1" /></div>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="required" /> Required</label>
        <Button type="submit">Add Field</Button>
      </form>
      <ul className="space-y-2">{template?.fields.map((f) => <li key={f.id} className="border bg-white p-3 text-sm">{f.name} · {f.fieldType}</li>)}</ul>
    </div>
  );
}
