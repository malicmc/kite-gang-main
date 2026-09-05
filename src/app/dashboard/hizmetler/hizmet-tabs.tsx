"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Waves,
  GraduationCap,
  CalendarDays,
  Timer,
  ShoppingCart,
  Package,
  IdCard,
  Settings,
} from "lucide-react";

const TABS = [
  { href: "/dashboard/hizmetler/seanslar", label: "Seanslar", icon: Waves },
  { href: "/dashboard/hizmetler/dersler", label: "Dersler", icon: GraduationCap },
  { href: "/dashboard/hizmetler/etkinlikler", label: "Etkinlikler", icon: CalendarDays },
  { href: "/dashboard/hizmetler/kiralamalar", label: "Kiralamalar", icon: Timer },
  { href: "/dashboard/hizmetler/urunler", label: "Ürünler", icon: ShoppingCart },
  { href: "/dashboard/hizmetler/paketler", label: "Paketler", icon: Package },
  { href: "/dashboard/hizmetler/uyelikler", label: "Üyelikler", icon: IdCard },
  { href: "/dashboard/hizmetler/ayarlar", label: "Hizmet Ayarları", icon: Settings },
];

export function HizmetTabs() {
  const pathname = usePathname();

  return (
    <div className="border-b">
      <nav className="flex gap-1 overflow-x-auto -mb-px">
        {TABS.map((tab) => {
          const active = pathname === tab.href || pathname.startsWith(`${tab.href}/`);
          const Icon = tab.icon;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex items-center gap-1.5 px-3.5 py-2.5 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
                active
                  ? "border-gray-900 text-gray-900"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
