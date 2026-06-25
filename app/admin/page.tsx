import { prisma } from "@/lib/prisma";
import { AdminHeader } from "@/components/admin/admin-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function AdminDashboard() {
  const [products, orders, dealers, pending] = await Promise.all([
    prisma.product.count(),
    prisma.dealerOrder.count(),
    prisma.user.count({ where: { role: "DEALER" } }),
    prisma.dealerOrder.count({ where: { status: "PENDING" } }),
  ]);
  return (
    <div>
      <AdminHeader title="Dashboard" />
      <div className="grid gap-4 md:grid-cols-4">
        {[
          ["Products", products],
          ["Orders", orders],
          ["Dealers", dealers],
          ["Pending Orders", pending],
        ].map(([label, value]) => (
          <Card key={String(label)}>
            <CardHeader><CardTitle>{label}</CardTitle></CardHeader>
            <CardContent><p className="text-3xl font-bold">{value}</p></CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
