import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { parseJson } from "@/lib/utils";

export default async function DealerOrdersPage({ searchParams }: { searchParams: Promise<{ success?: string }> }) {
  const session = await auth();
  const { success } = await searchParams;
  const orders = await prisma.dealerOrder.findMany({ where: { dealerId: session!.user!.id }, orderBy: { createdAt: "desc" } });
  return (
    <div>
      <h1 className="text-2xl font-semibold">Order History</h1>
      {success && <p className="mt-4 border border-green-200 bg-green-50 p-3 text-sm text-green-800">Order {success} submitted successfully.</p>}
      <div className="mt-6 space-y-4">
        {orders.map((o) => (
          <div key={o.id} className="border bg-white p-4">
            <div className="flex justify-between"><p className="font-medium">{o.orderNumber}</p><span className="text-sm">{o.status}</span></div>
            <p className="text-sm text-gray-500">{new Date(o.createdAt).toLocaleString()}</p>
            <dl className="mt-2 grid gap-1 text-sm">{Object.entries(parseJson<Record<string,string>>(o.formData, {})).map(([k,v]) => <div key={k}>{k}: {v}</div>)}</dl>
          </div>
        ))}
      </div>
    </div>
  );
}
