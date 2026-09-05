"use client";

import { Button } from "@/components/ui/button";
import { Download, ChevronDown, Users, User } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";

export function EgitmenlerExportButton({
  instructors,
}: {
  instructors: { id: string; name: string }[];
}) {
  function handleExport(instructorId: string) {
    window.open(`/api/export/egitmenler?instructorId=${instructorId}`, "_blank");
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="outline" />}>
        <Download className="w-4 h-4 mr-2" />
        CSV İndir
        <ChevronDown className="w-3.5 h-3.5 ml-1" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-56">
        <DropdownMenuItem onClick={() => handleExport("all")}>
          <Users className="w-3.5 h-3.5" /> Tüm Eğitmenler (Özet)
        </DropdownMenuItem>
        {instructors.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuLabel>Tek Eğitmen</DropdownMenuLabel>
              {instructors.map((i) => (
                <DropdownMenuItem key={i.id} onClick={() => handleExport(i.id)}>
                  <User className="w-3.5 h-3.5" /> {i.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
