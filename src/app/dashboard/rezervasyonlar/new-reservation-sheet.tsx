"use client";

import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Plus, CalendarPlus } from "lucide-react";
import { NewReservationForm } from "./yeni/new-reservation-form";

interface NewReservationSheetProps {
  students: { id: string; firstName: string; lastName: string }[];
  instructors: { id: string; color: string; user: { name: string } }[];
  equipment: { id: string; type: string; name: string; size: string | null }[];
}

export function NewReservationSheet({ students, instructors, equipment }: NewReservationSheetProps) {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger render={<Button />}>
        <Plus className="w-4 h-4 mr-2" />
        Yeni Rezervasyon
      </SheetTrigger>
      <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader className="border-b">
          <SheetTitle className="flex items-center gap-2 text-base">
            <CalendarPlus className="w-4 h-4" />
            Rezervasyon Ekle
          </SheetTitle>
        </SheetHeader>
        <div className="px-4 pb-4">
          <NewReservationForm
            students={students}
            instructors={instructors}
            equipment={equipment}
            onCancel={() => setOpen(false)}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
