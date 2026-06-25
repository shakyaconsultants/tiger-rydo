import { prisma } from "@/lib/prisma";
import { submitDealerOrder } from "@/lib/actions";
import { DynamicFormFields } from "@/lib/dynamic-form";
import { Button } from "@/components/ui/button";

export default async function NewOrderPage() {
  const template = await prisma.formTemplate.findFirst({ where: { active: true }, include: { fields: { orderBy: { sortOrder: "asc" } } } });
  return (
    <div>
      <h1 className="text-2xl font-semibold">Place Order</h1>
      {!template?.fields.length ? <p className="mt-4 text-gray-600">Order form not configured yet. Contact admin.</p> : (
        <form action={submitDealerOrder} className="mt-6 max-w-xl space-y-4 border bg-white p-6">
          <DynamicFormFields fields={template.fields} />
          <Button type="submit">Submit Order</Button>
        </form>
      )}
    </div>
  );
}
