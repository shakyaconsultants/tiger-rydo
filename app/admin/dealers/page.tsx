import { prisma } from "@/lib/prisma";
import { createDealer, resetDealerPassword } from "@/lib/actions";
import { AdminHeader } from "@/components/admin/admin-header";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default async function DealersPage() {
  const dealers = await prisma.user.findMany({ where: { role: "DEALER" }, orderBy: { createdAt: "desc" } });
  return (
    <div>
      <AdminHeader title="Dealers" />
      <form action={createDealer} className="mb-8 grid max-w-md gap-3 border bg-white p-4">
        <div><Label>Name</Label><Input name="name" required className="mt-1" /></div>
        <div><Label>Email</Label><Input name="email" type="email" required className="mt-1" /></div>
        <div><Label>Phone</Label><Input name="phone" className="mt-1" /></div>
        <div><Label>Temp Password</Label><Input name="password" type="password" required className="mt-1" /></div>
        <Button type="submit">Create Dealer</Button>
      </form>
      <div className="space-y-4">
        {dealers.map((d) => (
          <div key={d.id} className="border bg-white p-4">
            <p className="font-medium">{d.name}</p>
            <p className="text-sm text-gray-500">{d.email}{d.phone ? ` · ${d.phone}` : ""}</p>
            <form action={resetDealerPassword} className="mt-3 flex gap-2">
              <input type="hidden" name="id" value={d.id} />
              <Input name="password" type="password" placeholder="New password" required className="max-w-xs" />
              <Button type="submit" size="sm" variant="outline">Reset Password</Button>
            </form>
          </div>
        ))}
      </div>
    </div>
  );
}
