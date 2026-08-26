import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { headingFont, bodyFont } from "@/lib/fonts";

export const metadata: Metadata = {
  title: "KiteSurf Okulu Yönetim Sistemi",
  description: "Kitesurf okulu rezervasyon ve yönetim platformu",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="tr"
      className={`${headingFont.variable} ${bodyFont.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-background">
        {children}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
