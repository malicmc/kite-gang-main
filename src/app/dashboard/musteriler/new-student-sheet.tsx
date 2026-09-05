"use client";

import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Plus, UserPlus } from "lucide-react";
import { StudentForm } from "@/components/students/student-form";
import { createStudent } from "@/app/actions/students";

export function NewStudentSheet() {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger render={<Button />}>
        <Plus className="w-4 h-4 mr-2" />
        Yeni Müşteri
      </SheetTrigger>
      <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader className="border-b">
          <SheetTitle className="flex items-center gap-2 text-base">
            <UserPlus className="w-4 h-4" />
            Müşteri Ekle
          </SheetTitle>
        </SheetHeader>
        <div className="px-4 pb-4">
          <StudentForm action={createStudent} onCancel={() => setOpen(false)} />
        </div>
      </SheetContent>
    </Sheet>
  );
}
