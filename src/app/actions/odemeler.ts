"use server";

import { prisma } from "@/lib/prisma";
import { requireAdminOrReception } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const odemeSchema = z.object({
  studentId: z.string().min(1),
  hizmetId: z.string().optional(),
  amount: z.coerce.number().min(0.01, "Tutar gerekli"),
  currency: z.enum(["EUR", "USD", "TRY"]),
  method: z.enum(["CASH", "BANK_TRANSFER", "CREDIT_CARD", "OTHER"]),
  description: z.string().optional(),
});

export type OdemeFormState = { error?: string; fieldErrors?: Record<string, string[]> };

export async function recordMusteriOdeme(
  _prev: OdemeFormState,
  formData: FormData
): Promise<OdemeFormState> {
  const user = await requireAdminOrReception();
  const raw = {
    studentId: formData.get("studentId") as string,
    hizmetId: (formData.get("hizmetId") as string) || undefined,
    amount: formData.get("amount") as string,
    currency: formData.get("currency") as string,
    method: formData.get("method") as string,
    description: formData.get("description") as string || undefined,
  };
  const parsed = odemeSchema.safeParse(raw);
  if (!parsed.success) return { fieldErrors: parsed.error.flatten().fieldErrors };

  // Bir derse bağlı ödemede eğitmen hakedişi kasaya yansımaz — sadece net tutar kasa gelirine sayılır.
  let kasaAmount = parsed.data.amount;
  if (parsed.data.hizmetId) {
    const hizmet = await prisma.hizmet.findUnique({
      where: { id: parsed.data.hizmetId },
      select: { studentId: true, instructorEarning: true },
    });
    if (hizmet && hizmet.studentId === parsed.data.studentId && hizmet.instructorEarning) {
      kasaAmount = Math.max(0, parsed.data.amount - hizmet.instructorEarning);
    }
  }

  await prisma.payment.create({
    data: {
      studentId: parsed.data.studentId,
      hizmetId: parsed.data.hizmetId || null,
      amount: parsed.data.amount,
      kasaAmount,
      currency: parsed.data.currency,
      method: parsed.data.method,
      direction: "INCOMING",
      description: parsed.data.description || null,
      recordedById: user.userId,
    },
  });

  revalidatePath(`/dashboard/musteriler/${parsed.data.studentId}`);
  revalidatePath("/dashboard/musteriler");
  revalidatePath("/dashboard/kasa");
  revalidatePath("/dashboard");
  return {};
}

const manuelGelirSchema = z.object({
  amount: z.coerce.number().min(0.01, "Tutar gerekli"),
  currency: z.enum(["EUR", "USD", "TRY"]),
  method: z.enum(["CASH", "BANK_TRANSFER", "CREDIT_CARD", "OTHER"]),
  description: z.string().min(1, "Açıklama gerekli"),
});

export async function recordManuelGelir(
  _prev: OdemeFormState,
  formData: FormData
): Promise<OdemeFormState> {
  const user = await requireAdminOrReception();
  const raw = {
    amount: formData.get("amount") as string,
    currency: formData.get("currency") as string,
    method: formData.get("method") as string,
    description: formData.get("description") as string,
  };
  const parsed = manuelGelirSchema.safeParse(raw);
  if (!parsed.success) return { fieldErrors: parsed.error.flatten().fieldErrors };

  await prisma.payment.create({
    data: {
      amount: parsed.data.amount,
      currency: parsed.data.currency,
      method: parsed.data.method,
      direction: "INCOMING",
      description: parsed.data.description,
      recordedById: user.userId,
    },
  });

  revalidatePath("/dashboard/kasa");
  return {};
}
