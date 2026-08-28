"use server";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { logAudit } from "@/lib/audit";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { updateCashAccount } from "./packages";

const instructorSchema = z.object({
  name: z.string().min(1, "Ad zorunlu"),
  email: z.string().email("Geçerli email girin"),
  password: z.string().min(6, "En az 6 karakter şifre").optional().or(z.literal("")),
  phone: z.string().optional(),
  paymentModel: z.enum(["HOURLY_RATE", "REVENUE_SHARE", "SALARY_PLUS_BONUS"]),
  hourlyRate: z.coerce.number().optional(),
  hourlyRateCurrency: z.string().optional(),
  revenueShare: z.coerce.number().min(0).max(100).optional(),
  monthlySalary: z.coerce.number().optional(),
  salaryCurrency: z.string().optional(),
  color: z.string().default("#3B82F6"),
});

export type InstructorFormState = { error?: string; fieldErrors?: Record<string, string[]> };

export async function createInstructor(
  _prev: InstructorFormState,
  formData: FormData
): Promise<InstructorFormState> {
  const user = await requireAdmin();

  const raw = {
    name: formData.get("name") as string,
    email: formData.get("email") as string,
    password: formData.get("password") as string,
    phone: formData.get("phone") as string,
    paymentModel: formData.get("paymentModel") as string,
    hourlyRate: formData.get("hourlyRate") as string,
    hourlyRateCurrency: formData.get("hourlyRateCurrency") as string,
    revenueShare: formData.get("revenueShare") as string,
    monthlySalary: formData.get("monthlySalary") as string,
    salaryCurrency: formData.get("salaryCurrency") as string,
    color: formData.get("color") as string,
  };

  const parsed = instructorSchema.safeParse(raw);
  if (!parsed.success) return { fieldErrors: parsed.error.flatten().fieldErrors };

  const existingUser = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (existingUser) return { error: "Bu e-posta adresi zaten kullanılıyor" };

  if (!parsed.data.password) return { error: "Yeni eğitmen için şifre gerekli" };

  const hashedPassword = await bcrypt.hash(parsed.data.password, 12);

  const newUser = await prisma.user.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email,
      password: hashedPassword,
      role: "INSTRUCTOR",
    },
  });

  const instructor = await prisma.instructor.create({
    data: {
      userId: newUser.id,
      phone: parsed.data.phone || null,
      paymentModel: parsed.data.paymentModel,
      hourlyRate: parsed.data.hourlyRate ?? null,
      hourlyRateCurrency: parsed.data.hourlyRateCurrency || "EUR",
      revenueShare: parsed.data.revenueShare ?? null,
      monthlySalary: parsed.data.monthlySalary ?? null,
      salaryCurrency: parsed.data.salaryCurrency || "EUR",
      color: parsed.data.color || "#3B82F6",
    },
  });

  await logAudit({
    userId: user.userId,
    action: "CREATE",
    entity: "Instructor",
    entityId: instructor.id,
  });

  revalidatePath("/dashboard/egitmenler");
  redirect(`/dashboard/egitmenler/${instructor.id}`);
}

export async function updateInstructor(
  id: string,
  _prev: InstructorFormState,
  formData: FormData
): Promise<InstructorFormState> {
  const user = await requireAdmin();

  const raw = {
    name: formData.get("name") as string,
    email: formData.get("email") as string,
    password: formData.get("password") as string,
    phone: formData.get("phone") as string,
    paymentModel: formData.get("paymentModel") as string,
    hourlyRate: formData.get("hourlyRate") as string,
    hourlyRateCurrency: formData.get("hourlyRateCurrency") as string,
    revenueShare: formData.get("revenueShare") as string,
    monthlySalary: formData.get("monthlySalary") as string,
    salaryCurrency: formData.get("salaryCurrency") as string,
    color: formData.get("color") as string,
  };

  const parsed = instructorSchema.safeParse(raw);
  if (!parsed.success) return { fieldErrors: parsed.error.flatten().fieldErrors };

  const instructor = await prisma.instructor.findUnique({
    where: { id },
    include: { user: true },
  });
  if (!instructor) return { error: "Eğitmen bulunamadı" };

  const updateUserData: Record<string, unknown> = {
    name: parsed.data.name,
    email: parsed.data.email,
  };

  if (parsed.data.password) {
    updateUserData.password = await bcrypt.hash(parsed.data.password, 12);
  }

  await prisma.$transaction([
    prisma.user.update({ where: { id: instructor.userId }, data: updateUserData }),
    prisma.instructor.update({
      where: { id },
      data: {
        phone: parsed.data.phone || null,
        paymentModel: parsed.data.paymentModel,
        hourlyRate: parsed.data.hourlyRate ?? null,
        hourlyRateCurrency: parsed.data.hourlyRateCurrency || "EUR",
        revenueShare: parsed.data.revenueShare ?? null,
        monthlySalary: parsed.data.monthlySalary ?? null,
        salaryCurrency: parsed.data.salaryCurrency || "EUR",
        color: parsed.data.color || "#3B82F6",
      },
    }),
  ]);

  await logAudit({ userId: user.userId, action: "UPDATE", entity: "Instructor", entityId: id });
  revalidatePath(`/dashboard/egitmenler/${id}`);
  revalidatePath("/dashboard/egitmenler");
  return {};
}

export async function recordInstructorPayout(
  _prev: { error?: string },
  formData: FormData
): Promise<{ error?: string }> {
  const user = await requireAdmin();

  const instructorId = formData.get("instructorId") as string;
  const amount = parseFloat(formData.get("amount") as string);
  const currency = formData.get("currency") as string;
  const method = formData.get("method") as string;
  const notes = formData.get("notes") as string;
  const periodStart = formData.get("periodStart") as string;
  const periodEnd = formData.get("periodEnd") as string;
  const cashAccountId = (formData.get("cashAccountId") as string) || undefined;

  if (!amount || amount <= 0) return { error: "Geçerli tutar girin" };

  if (cashAccountId) {
    const account = await prisma.cashAccount.findUnique({ where: { id: cashAccountId } });
    if (!account) return { error: "Kasa hesabı bulunamadı" };
    if (account.balance < amount) {
      return { error: `Kasa bakiyesi yetersiz. Mevcut: ${account.balance.toFixed(2)} ${account.currency}` };
    }
  }

  // Mark earnings as paid
  const unpaidEarnings = await prisma.instructorEarning.findMany({
    where: {
      instructorId,
      isPaid: false,
      currency,
    },
  });

  const instructor = await prisma.instructor.findUnique({
    where: { id: instructorId },
    select: { user: { select: { name: true } } },
  });

  const payout = await prisma.$transaction(async (tx) => {
    const created = await tx.instructorPayout.create({
      data: {
        instructorId,
        amount,
        currency,
        method,
        notes: notes || null,
        periodStart: periodStart ? new Date(periodStart) : null,
        periodEnd: periodEnd ? new Date(periodEnd) : null,
        recordedById: user.userId,
      },
    });
    await Promise.all(
      unpaidEarnings.map((e) =>
        tx.instructorEarning.update({ where: { id: e.id }, data: { isPaid: true } })
      )
    );
    return created;
  });

  // Kasadan gerçekten para çıktığı için hakediş ödemesi de bir kasa hareketi olarak işlenir.
  if (cashAccountId) {
    await updateCashAccount(
      cashAccountId,
      amount,
      currency,
      "EXPENSE",
      null,
      null,
      user.userId,
      `Hakediş ödemesi · ${instructor?.user.name ?? "Eğitmen"}`,
      payout.id
    );
  }

  revalidatePath(`/dashboard/egitmenler/${instructorId}`);
  revalidatePath("/dashboard/kasa");
  return {};
}
