import Link from "next/link";
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
