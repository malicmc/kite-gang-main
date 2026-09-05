"use client";

import { updateStudent } from "@/app/actions/students";
import { StudentForm } from "@/components/students/student-form";
import type { Student } from "@/generated/prisma/client";

export function StudentEditForm({ student }: { student: Student }) {
  const boundAction = updateStudent.bind(null, student.id);
  return (
    <StudentForm
      action={boundAction}
      student={student}
      title="Bilgileri Düzenle"
      cancelHref={`/dashboard/musteriler/${student.id}`}
    />
  );
}
