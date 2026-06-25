import type { Metadata } from "next";
import { Providers } from "@/components/providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "TIGER RYDO - Premium Electric Scooters",
  description: "RIDE BOLD. RIDE CLEAN. RIDE FUTURE.",
  icons: { icon: "/brand/icon.svg" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
