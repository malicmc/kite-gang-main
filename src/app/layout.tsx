import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { Bricolage_Grotesque } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const geist = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const bricolage = Bricolage_Grotesque({
  variable: "--font-heading-display",
  subsets: ["latin"],
});

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
      className={`${geist.variable} ${bricolage.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-background">
        {children}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
