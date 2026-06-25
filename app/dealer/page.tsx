import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";

export default async function DealerDashboard() {
  const session = await auth();
  const orders = await prisma.dealerOrder.count({ where: { dealerId: session!.user!.id } });
  return (
    <div>
      <h1 className="text-2xl font-semibold">Welcome, {session?.user?.name}</h1>
      <p className="mt-2 text-gray-600">You have {orders} order(s) on record.</p>
      <div className="mt-6 flex gap-3">
        <Button asChild><Link href="/dealer/orders/new">Place New Order</Link></Button>
        <Button asChild variant="outline"><Link href="/dealer/orders">View History</Link></Button>
      </div>
    </div>
  );
}
