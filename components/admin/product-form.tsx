"use client";
import { useMemo, useState } from "react";
import { DynamicFormFields, DynamicField } from "@/lib/dynamic-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

type Type = { id: string; name: string };
type Param = DynamicField;
type Product = { id: string; name: string; slug: string; productTypeId: string; published: boolean; featured: boolean; values: { parameterId: string; value: string }[] };

export function ProductForm({ types, parameters = [], product, action }: { types: Type[]; parameters?: Param[]; product?: Product; action: (fd: FormData) => Promise<void> }) {
  const [typeId, setTypeId] = useState(product?.productTypeId || types[0]?.id || "");

  async function loadParams(id: string) {
    const res = await fetch(`/api/product-types/${id}/parameters`);
    return res.json();
  }

  const [fields, setFields] = useState<Param[]>(parameters);
  useMemo(() => { if (parameters.length) setFields(parameters); }, [parameters]);

  return (
    <form action={action} encType="multipart/form-data" className="max-w-2xl space-y-4">
      {product && <input type="hidden" name="id" value={product.id} />}
      <div><Label>Name</Label><Input name="name" defaultValue={product?.name} required className="mt-1" /></div>
      <div><Label>Slug</Label><Input name="slug" defaultValue={product?.slug} className="mt-1" /></div>
      <div>
        <Label>Product Type</Label>
        <select name="productTypeId" value={typeId} onChange={async (e) => { const v = e.target.value; setTypeId(v); setFields(await loadParams(v)); }} className="mt-1 h-10 w-full border px-3">
          {types.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
      </div>
      <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="published" defaultChecked={product?.published} /> Published</label>
      <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="featured" defaultChecked={product?.featured} /> Featured on Home</label>
      {fields.length > 0 && (
        <div className="border-t pt-4">
          <p className="mb-3 font-medium">Product Parameters</p>
          <DynamicFormFields fields={fields} />
          {product && fields.map((f) => {
            const val = product.values.find((v) => v.parameterId === f.id)?.value;
            if (!val || f.fieldType === "IMAGE" || f.fieldType === "VIDEO") return null;
            return <input key={f.id} type="hidden" name={f.slug} defaultValue={val} />;
          })}
        </div>
      )}
      <Button type="submit">Save Product</Button>
    </form>
  );
}
