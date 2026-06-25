import Link from "next/link";

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
