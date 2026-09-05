"use client";

import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

export function InstructorExportButton({ instructorId }: { instructorId: string }) {
  return (
    <Button
      variant="outline"
      onClick={() => window.open(`/api/export/egitmenler?instructorId=${instructorId}`, "_blank")}
    >
      <Download className="w-4 h-4 mr-2" />
      CSV İndir
    </Button>
  );
}
