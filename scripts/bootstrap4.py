import os
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

def w(rel, content):
    path = os.path.join(ROOT, rel.replace("/", os.sep))
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w", encoding="utf-8", newline="\n") as f:
        f.write(content.rstrip() + "\n")
    print("w", rel)

w("app/globals.css", '''@import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Space+Grotesk:wght@700&display=swap");
@import "tailwindcss";

:root {
  --color-brand-primary: #0A0A0B;
  --color-brand-secondary: #F5F5F7;
  --color-brand-accent: #FF5500;
  --color-text-muted: #6E6E73;
  --color-bg-dark: #1C1C1E;
  --font-display: "Space Grotesk", sans-serif;
  --font-body: "Inter", sans-serif;
}

@theme inline {
  --color-brand-primary: #0A0A0B;
  --color-brand-secondary: #F5F5F7;
  --color-brand-accent: #FF5500;
  --color-brand-muted: #6E6E73;
  --color-brand-darkGrey: #1C1C1E;
  --color-brand-lightGrey: #E5E5EA;
  --font-display: "Space Grotesk", sans-serif;
  --font-body: "Inter", sans-serif;
}

body {
  font-family: var(--font-body);
  background-color: var(--color-brand-secondary);
  color: var(--color-brand-primary);
  -webkit-font-smoothing: antialiased;
}

h1, h2, h3, h4, .brand-heading {
  font-family: var(--font-display);
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: -0.02em;
}
''')

w("app/layout.tsx", '''import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TIGER RYDO",
  description: "Premium electric scooters for modern urban mobility",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
''')

w("components/public/header.tsx", '''import Link from "next/link";
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
        <Link href="/login" className="text-sm font-medium text-brand-accent">Dealer Login</Link>
      </div>
    </header>
  );
}
''')

w("components/public/footer.tsx", '''import Link from "next/link";

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
''')

w("components/public/whatsapp-button.tsx", '''import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { whatsappUrl } from "@/lib/utils";

export function WhatsAppButton({ number, message, label = "Contact Us" }: { number: string; message: string; label?: string }) {
  return (
    <Link
      href={whatsappUrl(number, message)}
      target="_blank"
      className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-brand-accent px-4 py-3 text-sm font-semibold text-white shadow-lg hover:bg-orange-600"
    >
      <MessageCircle className="h-5 w-5" />
      <span className="hidden sm:inline">{label}</span>
    </Link>
  );
}
''')

w("app/(public)/layout.tsx", '''import { Header } from "@/components/public/header";
import { Footer } from "@/components/public/footer";
import { WhatsAppButton } from "@/components/public/whatsapp-button";
import { getSiteSettings } from "@/lib/settings";

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSiteSettings();
  return (
    <>
      <Header siteName={settings.siteName} logoUrl={settings.logoUrl} />
      <main className="flex-1">{children}</main>
      <Footer siteName={settings.siteName} footerText={settings.footerText} phone={settings.phone} address={settings.address} />
      <WhatsAppButton number={settings.customerWhatsapp} message={settings.customerWhatsappMsg} />
    </>
  );
}
''')

print("bootstrap4 done")