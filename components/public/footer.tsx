import Link from "next/link";

export function Footer({ siteName, footerText, phone, address }: { siteName: string; footerText?: string | null; phone: string; address?: string | null }) {
  return (
    <footer className="bg-brand-primary text-white">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 md:grid-cols-3">
        <div>
          <p className="brand-heading text-xl">{siteName}</p>
          <p className="mt-2 text-sm text-white/70">{footerText || "Intelligent electric vehicles for the city and beyond."}</p>
        </div>
        <div>
          <p className="brand-heading text-sm">Quick Links</p>
          <div className="mt-3 flex flex-col gap-2 text-sm text-white/80">
            <Link href="/products">Products</Link>
            <Link href="/about">About</Link>
            <Link href="/contact">Contact</Link>
          </div>
        </div>
        <div>
          <p className="brand-heading text-sm">Contact</p>
          <p className="mt-3 text-sm text-white/80">+91 {phone}</p>
          {address && <p className="mt-1 text-sm text-white/70">{address}</p>}
        </div>
      </div>
      <div className="border-t border-white/10 py-4 text-center text-xs text-white/50">© {new Date().getFullYear()} {siteName}. All rights reserved.</div>
    </footer>
  );
}
