import Link from "next/link";
import Image from "next/image";

const links = [
  { href: "/", label: "Home" },
  { href: "/products", label: "Products" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export function Header({ siteName, logoUrl }: { siteName: string; logoUrl: string }) {
  return (
    <header className="sticky top-0 z-40 border-b border-brand-lightGrey bg-brand-secondary/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
        <Link href="/" className="flex items-center gap-3">
          <Image src={logoUrl} alt={siteName} width={140} height={40} className="h-10 w-auto" priority />
        </Link>
        <nav className="hidden items-center gap-8 md:flex">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="text-sm font-medium hover:text-brand-accent">
              {l.label}
            </Link>
          ))}
        </nav>
        <Link href="/login?callbackUrl=/dealer" className="text-sm font-medium text-brand-accent">Dealer Login</Link>
      </div>
    </header>
  );
}
