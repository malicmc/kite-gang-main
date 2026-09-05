"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Download, ChevronDown, TrendingUp, TrendingDown, Users, Clock, GraduationCap, FileSpreadsheet } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

const OPTIONS: { type: string; label: string; icon: typeof Download }[] = [
  { type: "all", label: "Tüm Rapor (Gelir + Gider)", icon: FileSpreadsheet },
  { type: "income", label: "Gelirler", icon: TrendingUp },
  { type: "expense", label: "Giderler", icon: TrendingDown },
  { type: "instructors", label: "Eğitmen Detayları (Hakediş + Ödeme)", icon: Users },
  { type: "receivables", label: "Bekleyen Alacaklar", icon: Clock },
  { type: "lessons", label: "Ders İstatistikleri", icon: GraduationCap },
];

export function ExportButton() {
  function handleExport(type: string) {
    const params = new URLSearchParams(window.location.search);
    params.set("type", type);
    window.open(`/api/export/rapor?${params.toString()}`, "_blank");
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="outline" />}>
        <Download className="w-4 h-4 mr-2" />
        CSV İndir
        <ChevronDown className="w-3.5 h-3.5 ml-1" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-64">
        {OPTIONS.map((opt, i) => {
          const Icon = opt.icon;
          return (
            <React.Fragment key={opt.type}>
              {i === 1 && <DropdownMenuSeparator />}
              <DropdownMenuItem onClick={() => handleExport(opt.type)}>
                <Icon className="w-3.5 h-3.5" /> {opt.label}
              </DropdownMenuItem>
            </React.Fragment>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
