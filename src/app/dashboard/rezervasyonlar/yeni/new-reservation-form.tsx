"use client";

import { useActionState, useState } from "react";
import { createReservation } from "@/app/actions/reservations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StudentSelect } from "@/components/students/student-select";
import { LESSON_TYPES, CURRENCIES, EQUIPMENT_TYPES } from "@/lib/constants";
import { useExchangeRates } from "@/hooks/use-exchange-rates";
import { convertAmount } from "@/lib/currency";
import { format } from "date-fns";

interface NewReservationFormProps {
  students: { id: string; firstName: string; lastName: string }[];
  instructors: { id: string; color: string; user: { name: string } }[];
  equipment: { id: string; type: string; name: string; size: string | null }[];
}

function getDefaultStartTime() {
  const nextHour = new Date();
  nextHour.setHours(nextHour.getHours() + 1, 0, 0, 0);
  return format(nextHour, "yyyy-MM-dd'T'HH:mm");
}

export function NewReservationForm({ students, instructors, equipment }: NewReservationFormProps) {
  const [state, formAction, isPending] = useActionState(createReservation, {});
  const [startTime, setStartTime] = useState(getDefaultStartTime);
  const [plannedHours, setPlannedHours] = useState("2");
  const [studentId, setStudentId] = useState("");
  const [creatingStudent, setCreatingStudent] = useState(false);
  const [lessonType, setLessonType] = useState("PRIVATE");
  const [rentalAmount, setRentalAmount] = useState("");
  const [rentalCurrency, setRentalCurrency] = useState("EUR");
  const rates = useExchangeRates();

  // React 19's <form action> native-resets uncontrolled <select> DOM after every
  // submit attempt (success or fieldErrors), desyncing it from our own state.
  // Remounting on each action response re-syncs the select to the real value.
  const [prevState, setPrevState] = useState(state);
  const [formGen, setFormGen] = useState(0);
  if (prevState !== state) {
    setPrevState(state);
    setFormGen((g) => g + 1);
  }

  const fieldErrors = state.fieldErrors ?? {};

  function handleRentalCurrencyChange(next: string) {
    const converted = convertAmount(Number(rentalAmount) || 0, rentalCurrency, next, rates);
    if (converted) setRentalAmount(converted.toFixed(2));
    setRentalCurrency(next);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Rezervasyon Bilgileri</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
          {state.error && (
            <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded">{state.error}</p>
          )}

          <StudentSelect
            key={formGen}
            students={students}
            value={studentId}
            onChange={setStudentId}
            onModeChange={setCreatingStudent}
          />
          {fieldErrors.studentId && <p className="text-xs text-red-500">{fieldErrors.studentId[0]}</p>}

          <div className="space-y-1.5">
            <Label>Ders Tipi *</Label>
            <select
              key={formGen}
              name="lessonType"
              className="w-full border rounded-md px-3 py-2 text-sm bg-white"
              value={lessonType}
              onChange={(e) => setLessonType(e.target.value)}
              required
            >
              {Object.entries(LESSON_TYPES).map(([v, l]) => (
                <option key={v} value={v}>{l}</option>
              ))}
            </select>
          </div>

          {lessonType !== "EQUIPMENT_RENTAL" && (
            <div className="space-y-1.5">
              <Label>Eğitmen *</Label>
              <select name="instructorId" className="w-full border rounded-md px-3 py-2 text-sm bg-white" required>
                <option value="">Eğitmen seçin...</option>
                {instructors.map((i) => (
                  <option key={i.id} value={i.id}>
                    {i.user.name}
                  </option>
                ))}
              </select>
              {fieldErrors.instructorId && <p className="text-xs text-red-500">{fieldErrors.instructorId[0]}</p>}
            </div>
          )}

          {lessonType === "EQUIPMENT_RENTAL" && (
            <div className="space-y-3 border rounded-md p-3 bg-gray-50">
              <div className="space-y-1.5">
                <Label>Kiralanan Ekipman *</Label>
                <select name="equipmentId" className="w-full border rounded-md px-3 py-2 text-sm bg-white" required>
                  <option value="">Ekipman seçin...</option>
                  {equipment.map((e) => (
                    <option key={e.id} value={e.id}>
                      {EQUIPMENT_TYPES[e.type as keyof typeof EQUIPMENT_TYPES] ?? e.type} — {e.name}
                      {e.size ? ` (${e.size})` : ""}
                    </option>
                  ))}
                </select>
                {fieldErrors.equipmentId && <p className="text-xs text-red-500">{fieldErrors.equipmentId[0]}</p>}
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2 space-y-1.5">
                  <Label>Kiralama Ücreti *</Label>
                  <Input
                    name="rentalAmount"
                    type="number"
                    step="0.01"
                    min="0"
                    value={rentalAmount}
                    onChange={(e) => setRentalAmount(e.target.value)}
                    required
                  />
                  {fieldErrors.rentalAmount && <p className="text-xs text-red-500">{fieldErrors.rentalAmount[0]}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label>Para Birimi</Label>
                  <select
                    name="rentalCurrency"
                    className="w-full border rounded-md px-3 py-2 text-sm bg-white"
                    value={rentalCurrency}
                    onChange={(e) => handleRentalCurrencyChange(e.target.value)}
                  >
                    {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="startTime">Başlangıç *</Label>
              <Input
                id="startTime"
                name="startTime"
                type="datetime-local"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                required
              />
              {fieldErrors.startTime && <p className="text-xs text-red-500">{fieldErrors.startTime[0]}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="plannedHours">Süre (Saat) *</Label>
              <Input
                id="plannedHours"
                name="plannedHours"
                type="number"
                step="0.5"
                min="0.5"
                value={plannedHours}
                onChange={(e) => setPlannedHours(e.target.value)}
                required
              />
              {fieldErrors.plannedHours && <p className="text-xs text-red-500">{fieldErrors.plannedHours[0]}</p>}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="notes">Notlar</Label>
            <Input id="notes" name="notes" placeholder="Ders notları..." />
          </div>

          <div className="flex justify-end pt-2">
            <Button type="submit" disabled={isPending || creatingStudent}>
              {isPending ? "Kaydediliyor..." : "Rezervasyon Oluştur"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
