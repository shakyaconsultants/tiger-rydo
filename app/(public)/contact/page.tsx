import { redirect } from "next/navigation";
import { getSiteSettings } from "@/lib/settings";
import { whatsappUrl } from "@/lib/utils";

export default async function ContactPage() {
  const settings = await getSiteSettings();
  redirect(whatsappUrl(settings.customerWhatsapp, settings.customerWhatsappMsg));
}
