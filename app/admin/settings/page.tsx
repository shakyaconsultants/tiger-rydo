import { getSiteSettings } from "@/lib/settings";
import { updateSiteSettings } from "@/lib/actions";
import { AdminHeader } from "@/components/admin/admin-header";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default async function SettingsPage() {
  const s = await getSiteSettings();
  return (
    <div>
      <AdminHeader title="Site Settings" />
      <form action={updateSiteSettings} className="max-w-2xl space-y-4">
        {[
          ["siteName", "Site Name", s.siteName],
          ["tagline", "Tagline", s.tagline],
          ["phone", "Phone", s.phone],
          ["customerWhatsapp", "Customer WhatsApp", s.customerWhatsapp],
          ["dealershipWhatsapp", "Dealership WhatsApp", s.dealershipWhatsapp],
          ["customerWhatsappMsg", "Customer WhatsApp Message", s.customerWhatsappMsg],
          ["dealershipWhatsappMsg", "Dealership WhatsApp Message", s.dealershipWhatsappMsg],
          ["address", "Address", s.address || ""],
        ].map(([name, label, value]) => (
          <div key={name}><Label>{label}</Label><Input name={name} defaultValue={value} className="mt-1" /></div>
        ))}
        <div><Label>Footer Text</Label><Textarea name="footerText" defaultValue={s.footerText || ""} className="mt-1" /></div>
        <Button type="submit">Save Settings</Button>
      </form>
    </div>
  );
}
