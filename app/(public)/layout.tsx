import { Header } from "@/components/public/header";
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
