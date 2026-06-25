import { prisma } from "@/lib/prisma";
import { updateOrderStatus } from "@/lib/actions";
import { AdminHeader } from "@/components/admin/admin-header";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { parseJson } from "@/lib/utils";

export default async function OrdersPage() {
  const orders = await prisma.dealerOrder.findMany({ include: { dealer: true }, orderBy: { createdAt: "desc" } });
  return (
    <div>
      <AdminHeader title="Dealer Orders" />
      <div className="space-y-4">
        {orders.map((o) => {
          const data = parseJson<Record<string, string>>(o.formData, {});
          return (
            <div key={o.id} className="border bg-white p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-medium">{o.orderNumber}</p>
                <p className="text-sm text-gray-500">{o.dealer.name} · {new Date(o.createdAt).toLocaleString()}</p>
              </div>
              <dl className="mt-3 grid gap-1 text-sm md:grid-cols-2">{Object.entries(data).map(([k, v]) => <div key={k}><span className="text-gray-500">{k}:</span> {v}</div>)}</dl>
              <form action={updateOrderStatus} className="mt-4 flex flex-wrap gap-2">
                <input type="hidden" name="id" value={o.id} />
                <select name="status" defaultValue={o.status} className="h-10 border px-3 text-sm">
                  {["PENDING","CONFIRMED","DISPATCHED","DELIVERED","CANCELLED"].map((s) => <option key={s}>{s}</option>)}
                </select>
                <Input name="adminNotes" defaultValue={o.adminNotes || ""} placeholder="Admin notes" className="max-w-xs" />
                <Button type="submit" size="sm">Update</Button>
              </form>
            </div>
          );
        })}
      </div>
    </div>
  );
}
