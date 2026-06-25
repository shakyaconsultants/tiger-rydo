import Link from "next/link";
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
