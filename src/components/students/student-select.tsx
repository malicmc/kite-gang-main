"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserPlus } from "lucide-react";
import { createQuickStudent } from "@/app/actions/students";
import { toast } from "sonner";

type Student = { id: string; firstName: string; lastName: string };

export function StudentSelect({
  students,
  value,
  onChange,
  name = "studentId",
  required = true,
  label = "Öğrenci *",
  onModeChange,
}: {
  students: Student[];
  value: string;
  onChange: (id: string) => void;
  name?: string;
  required?: boolean;
  label?: string;
  onModeChange?: (isCreatingNew: boolean) => void;
}) {
  const [localStudents, setLocalStudents] = useState(students);
  const [showNew, setShowNewRaw] = useState(false);
  function setShowNew(v: boolean) {
    setShowNewRaw(v);
    onModeChange?.(v);
  }
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleSelectChange(v: string) {
    if (v === "__new__") {
      setShowNew(true);
      setError("");
    } else {
      onChange(v);
    }
  }

  function handleCreate() {
    setError("");
    const fd = new FormData();
    fd.set("firstName", firstName);
    fd.set("lastName", lastName);
    fd.set("phone", phone);
    fd.set("email", email);
    startTransition(async () => {
      const result = await createQuickStudent({}, fd);
      if (result.fieldErrors || result.error) {
        setError(Object.values(result.fieldErrors ?? {}).flat()[0] ?? result.error ?? "Müşteri eklenemedi");
        return;
      }
      if (result.studentId) {
        setLocalStudents((prev) => [{ id: result.studentId!, firstName, lastName }, ...prev]);
        onChange(result.studentId);
        setShowNew(false);
        setFirstName("");
        setLastName("");
        setPhone("");
        setEmail("");
        toast.success("Müşteri eklendi");
      }
    });
  }

  if (showNew) {
    return (
      <div className="space-y-2 border rounded-md p-3 bg-gray-50">
        <div className="flex items-center justify-between">
          <Label className="flex items-center gap-1.5">
            <UserPlus className="w-3.5 h-3.5" /> Yeni Müşteri
          </Label>
          <button type="button" onClick={() => setShowNew(false)} className="text-xs text-blue-600 hover:underline">
            ← Listeden seç
          </button>
        </div>
        {error && <p className="text-sm text-red-500">{error}</p>}
        <div className="grid grid-cols-2 gap-2">
          <Input placeholder="Ad *" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
          <Input placeholder="Soyad *" value={lastName} onChange={(e) => setLastName(e.target.value)} />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Input placeholder="Telefon" value={phone} onChange={(e) => setPhone(e.target.value)} />
          <Input placeholder="E-posta" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <Button
          type="button"
          size="sm"
          className="w-full"
          disabled={isPending || !firstName || !lastName}
          onClick={handleCreate}
        >
          {isPending ? "Ekleniyor..." : "Müşteriyi Ekle ve Seç"}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <select
        name={name}
        className="w-full border rounded-md px-3 py-2 text-sm bg-white"
        required={required}
        value={value}
        onChange={(e) => handleSelectChange(e.target.value)}
      >
        <option value="">Öğrenci seçin...</option>
        <option value="__new__">+ Yeni Müşteri Ekle</option>
        {localStudents.map((s) => (
          <option key={s.id} value={s.id}>{s.firstName} {s.lastName}</option>
        ))}
      </select>
    </div>
  );
}
