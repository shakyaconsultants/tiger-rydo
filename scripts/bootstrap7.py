import os
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

def w(rel, content):
    path = os.path.join(ROOT, rel.replace("/", os.sep))
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w", encoding="utf-8", newline="\n") as f:
        f.write(content.rstrip() + "\n")
    print("w", rel)

w("components/admin/sidebar.tsx", '''import Link from "next/link";

const links = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/settings", label: "Site Settings" },
  { href: "/admin/pages", label: "Page Content" },
  { href: "/admin/heroes", label: "Hero Banners" },
  { href: "/admin/testimonials", label: "Testimonials" },
  { href: "/admin/product-types", label: "Product Types" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/form-builder", label: "Order Form" },
  { href: "/admin/dealers", label: "Dealers" },
  { href: "/admin/orders", label: "Orders" },
];

export function AdminSidebar() {
  return (
    <aside className="w-64 shrink-0 border-r bg-white p-4">
      <p className="mb-6 text-xs font-semibold uppercase tracking-wider text-gray-500">Admin Panel</p>
      <nav className="flex flex-col gap-1">
        {links.map((l) => (
          <Link key={l.href} href={l.href} className="px-3 py-2 text-sm hover:bg-gray-100">{l.label}</Link>
        ))}
      </nav>
    </aside>
  );
}
''')

w("components/admin/admin-header.tsx", '''import { signOut } from "@/lib/auth";
import { Button } from "@/components/ui/button";

export function AdminHeader({ title }: { title: string }) {
  return (
    <div className="mb-6 flex items-center justify-between border-b pb-4">
      <h1 className="text-2xl font-semibold">{title}</h1>
      <form action={async () => { "use server"; await signOut({ redirectTo: "/" }); }}>
        <Button type="submit" variant="outline" size="sm">Sign out</Button>
      </form>
    </div>
  );
}
''')

w("app/admin/layout.tsx", '''import { AdminSidebar } from "@/components/admin/sidebar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />
      <div className="flex-1 p-8">{children}</div>
    </div>
  );
}
''')

w("app/admin/page.tsx", '''import { prisma } from "@/lib/prisma";
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
''')

w("app/dealer/layout.tsx", '''import Link from "next/link";
import { signOut } from "@/lib/auth";
import { Button } from "@/components/ui/button";

const links = [
  { href: "/dealer", label: "Dashboard" },
  { href: "/dealer/orders/new", label: "Place Order" },
  { href: "/dealer/orders", label: "Order History" },
  { href: "/dealer/change-password", label: "Change Password" },
  { href: "/dealer/profile", label: "Profile" },
];

export default function DealerLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <p className="font-semibold">Dealer Portal</p>
          <nav className="flex items-center gap-4">
            {links.map((l) => <Link key={l.href} href={l.href} className="text-sm hover:underline">{l.label}</Link>)}
            <form action={async () => { "use server"; await signOut({ redirectTo: "/" }); }}>
              <Button type="submit" variant="outline" size="sm">Sign out</Button>
            </form>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-5xl p-6">{children}</main>
    </div>
  );
}
''')

w("app/dealer/page.tsx", '''import Link from "next/link";
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
''')

print("bootstrap7 done")