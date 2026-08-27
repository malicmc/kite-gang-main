import { requireAdminOrReception } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CURRENCY_SYMBOLS, EQUIPMENT_TYPES } from "@/lib/constants";
import { format, startOfDay, endOfDay, startOfWeek, endOfWeek } from "date-fns";
import { tr } from "date-fns/locale";
import { Users, Clock, Wallet, GraduationCap, Wrench, Package } from "lucide-react";
import { PeriodNav } from "./period-nav";
import Link from "next/link";

function formatMoney(amount: number, currency: string) {
  const symbol = CURRENCY_SYMBOLS[currency as keyof typeof CURRENCY_SYMBOLS] ?? currency;
  return `${symbol}${amount.toFixed(2)}`;
}

type Session = {
  date: Date;
  instructorId: string | null;
  studentName: string;
  title: string;
  amount: number;
  currency: string;
  hours: number | null;
  earned: boolean;
};

type Rental = {
  date: Date;
  equipmentKey: string;
  studentName: string;
  title: string;
  amount: number;
  currency: string;
  earned: boolean;
};

export default async function PerformansOzetiPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string; date?: string }>;
}) {
  await requireAdminOrReception();
  const params = await searchParams;
  const period = params.period === "haftalik" ? "haftalik" : "gunluk";
  const anchorDate = params.date ? new Date(params.date + "T00:00:00") : new Date();

  const rangeStart = period === "gunluk" ? startOfDay(anchorDate) : startOfWeek(anchorDate, { weekStartsOn: 1 });
  const rangeEnd = period === "gunluk" ? endOfDay(anchorDate) : endOfWeek(anchorDate, { weekStartsOn: 1 });

  const label =
    period === "gunluk"
      ? format(anchorDate, "d MMMM yyyy, EEEE", { locale: tr })
      : `${format(rangeStart, "d MMM", { locale: tr })} – ${format(rangeEnd, "d MMM yyyy", { locale: tr })}`;

  const dateFilter = {
    OR: [
      { scheduledAt: { gte: rangeStart, lte: rangeEnd } },
      { scheduledAt: null, createdAt: { gte: rangeStart, lte: rangeEnd } },
    ],
  };

  const [lessons, hizmetler, instructors, kiralamalar, equipmentList, randevuKiralamalari] = await Promise.all([
    prisma.lesson.findMany({
      where: { checkInTime: { gte: rangeStart, lte: rangeEnd } },
      include: {
        student: { select: { firstName: true, lastName: true } },
        instructor: { include: { user: { select: { name: true } } } },
        instructorEarning: true,
      },
    }),
    prisma.hizmet.findMany({
      where: { category: "EGITIM", isActive: true, instructorId: { not: null }, ...dateFilter },
      include: {
        student: { select: { firstName: true, lastName: true } },
        instructor: { include: { user: { select: { name: true } } } },
      },
    }),
    prisma.instructor.findMany({
      where: { isActive: true },
      include: { user: { select: { name: true } } },
      orderBy: { user: { name: "asc" } },
    }),
    prisma.hizmet.findMany({
      where: { category: "KIRALAMA", isActive: true, ...dateFilter },
      include: {
        student: { select: { firstName: true, lastName: true } },
        equipment: { select: { id: true, type: true, name: true, size: true } },
      },
    }),
    prisma.equipment.findMany({
      where: { isActive: true },
      select: { id: true, type: true, name: true, size: true },
    }),
    prisma.reservation.findMany({
      where: { lessonType: "EQUIPMENT_RENTAL", isActive: true, startTime: { gte: rangeStart, lte: rangeEnd } },
      include: {
        student: { select: { firstName: true, lastName: true } },
        equipment: { select: { id: true, type: true, name: true, size: true } },
      },
    }),
  ]);

  // ─── Eğitmen dersleri ───────────────────────────────────────────────────────

  const sessions: Session[] = [];

  for (const l of lessons) {
    if (!l.instructor) continue;
    sessions.push({
      date: l.checkInTime,
      instructorId: l.instructorId,
      studentName: `${l.student.firstName} ${l.student.lastName}`,
      title: "Ders",
      amount: l.instructorEarning?.amount ?? 0,
      currency: l.instructorEarning?.currency ?? l.instructor.hourlyRateCurrency,
      hours: l.actualHours,
      earned: !!l.instructorEarning,
    });
  }

  for (const h of hizmetler) {
    if (!h.instructor || !h.student) continue;
    sessions.push({
      date: h.scheduledAt ?? h.createdAt,
      instructorId: h.instructorId!,
      studentName: `${h.student.firstName} ${h.student.lastName}`,
      title: h.title,
      amount: h.status === "TAMAMLANDI" ? h.instructorEarning ?? 0 : 0,
      currency: h.currency,
      hours: null,
      earned: h.status === "TAMAMLANDI" && !!h.instructorEarning,
    });
  }

  sessions.sort((a, b) => b.date.getTime() - a.date.getTime());

  type InstructorStat = {
    id: string;
    name: string;
    color: string;
    sessions: Session[];
    totalHours: number;
    earningsByCurrency: Record<string, number>;
    studentCounts: Record<string, number>;
  };

  const byInstructor = new Map<string, InstructorStat>();
  for (const inst of instructors) {
    byInstructor.set(inst.id, {
      id: inst.id,
      name: inst.user.name,
      color: inst.color,
      sessions: [],
      totalHours: 0,
      earningsByCurrency: {},
      studentCounts: {},
    });
  }

  const grandEarnings: Record<string, number> = {};

  for (const s of sessions) {
    if (!s.instructorId) continue;
    const stat = byInstructor.get(s.instructorId);
    if (!stat) continue;
    stat.sessions.push(s);
    if (s.hours) stat.totalHours += s.hours;
    stat.studentCounts[s.studentName] = (stat.studentCounts[s.studentName] ?? 0) + 1;
    if (s.earned && s.amount > 0) {
      stat.earningsByCurrency[s.currency] = (stat.earningsByCurrency[s.currency] ?? 0) + s.amount;
      grandEarnings[s.currency] = (grandEarnings[s.currency] ?? 0) + s.amount;
    }
  }

  const instructorStats = [...byInstructor.values()].sort((a, b) => b.sessions.length - a.sessions.length);
  const activeInstructorStats = instructorStats.filter((s) => s.sessions.length > 0);
  const emptyInstructorStats = instructorStats.filter((s) => s.sessions.length === 0);

  // ─── Ekipman kiralamaları ───────────────────────────────────────────────────

  const UNASSIGNED_KEY = "__unassigned__";

  const rentals: Rental[] = kiralamalar.map((h) => ({
    date: h.scheduledAt ?? h.createdAt,
    equipmentKey: h.equipment?.id ?? UNASSIGNED_KEY,
    studentName: h.student ? `${h.student.firstName} ${h.student.lastName}` : "—",
    title: h.title,
    amount: h.status === "TAMAMLANDI" ? h.amount : 0,
    currency: h.currency,
    earned: h.status === "TAMAMLANDI",
  }));

  for (const r of randevuKiralamalari) {
    rentals.push({
      date: r.startTime,
      equipmentKey: r.equipment?.id ?? UNASSIGNED_KEY,
      studentName: `${r.student.firstName} ${r.student.lastName}`,
      title: "Ekipman Kiralama (Randevu)",
      amount: r.status === "COMPLETED" ? r.rentalAmount ?? 0 : 0,
      currency: r.rentalCurrency ?? "EUR",
      earned: r.status === "COMPLETED",
    });
  }

  rentals.sort((a, b) => b.date.getTime() - a.date.getTime());

  type EquipmentStat = {
    id: string;
    name: string;
    rentals: Rental[];
    revenueByCurrency: Record<string, number>;
  };

  const byEquipment = new Map<string, EquipmentStat>();
  for (const eq of equipmentList) {
    const typeLabel = EQUIPMENT_TYPES[eq.type as keyof typeof EQUIPMENT_TYPES] ?? eq.type;
    byEquipment.set(eq.id, {
      id: eq.id,
      name: `${typeLabel} — ${eq.name}${eq.size ? ` (${eq.size})` : ""}`,
      rentals: [],
      revenueByCurrency: {},
    });
  }
  byEquipment.set(UNASSIGNED_KEY, {
    id: UNASSIGNED_KEY,
    name: "Belirtilmemiş / Genel Kiralama",
    rentals: [],
    revenueByCurrency: {},
  });

  const grandRentalRevenue: Record<string, number> = {};

  for (const r of rentals) {
    let stat = byEquipment.get(r.equipmentKey);
    if (!stat) {
      // Equipment was deactivated after the rental was recorded
      stat = { id: r.equipmentKey, name: "Silinmiş / Pasif Ekipman", rentals: [], revenueByCurrency: {} };
      byEquipment.set(r.equipmentKey, stat);
    }
    stat.rentals.push(r);
    if (r.earned && r.amount > 0) {
      stat.revenueByCurrency[r.currency] = (stat.revenueByCurrency[r.currency] ?? 0) + r.amount;
      grandRentalRevenue[r.currency] = (grandRentalRevenue[r.currency] ?? 0) + r.amount;
    }
  }

  const equipmentStats = [...byEquipment.values()].sort((a, b) => b.rentals.length - a.rentals.length);
  const activeEquipmentStats = equipmentStats.filter((s) => s.rentals.length > 0);
  const emptyEquipmentStats = equipmentStats.filter((s) => s.rentals.length === 0 && s.id !== UNASSIGNED_KEY);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Performans Özeti</h1>
          <p className="text-gray-500 text-sm mt-1">Eğitmenlerin ders performansı ve ekipman kiralama gelirleri</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex border rounded-md overflow-hidden">
            <Link
              href={`/dashboard/performans-ozeti?period=gunluk&date=${format(anchorDate, "yyyy-MM-dd")}`}
              className={`px-3 py-1.5 text-sm font-medium transition-colors ${
                period === "gunluk" ? "bg-blue-600 text-white" : "bg-white text-gray-600 hover:bg-gray-50"
              }`}
            >
              Günlük
            </Link>
            <Link
              href={`/dashboard/performans-ozeti?period=haftalik&date=${format(anchorDate, "yyyy-MM-dd")}`}
              className={`px-3 py-1.5 text-sm font-medium transition-colors border-l ${
                period === "haftalik" ? "bg-blue-600 text-white" : "bg-white text-gray-600 hover:bg-gray-50"
              }`}
            >
              Haftalık
            </Link>
          </div>
          <PeriodNav period={period} date={format(anchorDate, "yyyy-MM-dd")} label={label} />
        </div>
      </div>

      {/* Grand Totals */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-2 text-gray-500 text-xs mb-1">
              <GraduationCap className="w-3.5 h-3.5" /> Toplam Ders
            </div>
            <p className="text-2xl font-bold text-gray-900">{sessions.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-2 text-gray-500 text-xs mb-1">
              <Users className="w-3.5 h-3.5" /> Aktif Eğitmen
            </div>
            <p className="text-2xl font-bold text-gray-900">{activeInstructorStats.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-2 text-gray-500 text-xs mb-1">
              <Wrench className="w-3.5 h-3.5" /> Toplam Kiralama
            </div>
            <p className="text-2xl font-bold text-gray-900">{rentals.length}</p>
          </CardContent>
        </Card>
        {Object.entries(grandEarnings).length > 0 ? (
          Object.entries(grandEarnings).map(([currency, amount]) => (
            <Card key={currency} className="border-green-200 bg-green-50">
              <CardContent className="pt-4 pb-4">
                <div className="flex items-center gap-2 text-green-700 text-xs mb-1">
                  <Wallet className="w-3.5 h-3.5" /> Eğitmen Kazancı ({currency})
                </div>
                <p className="text-2xl font-bold text-green-700">{formatMoney(amount, currency)}</p>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-2 text-gray-500 text-xs mb-1">
                <Wallet className="w-3.5 h-3.5" /> Eğitmen Kazancı
              </div>
              <p className="text-2xl font-bold text-gray-400">—</p>
            </CardContent>
          </Card>
        )}
        {Object.entries(grandRentalRevenue).length > 0 ? (
          Object.entries(grandRentalRevenue).map(([currency, amount]) => (
            <Card key={currency} className="border-orange-200 bg-orange-50">
              <CardContent className="pt-4 pb-4">
                <div className="flex items-center gap-2 text-orange-700 text-xs mb-1">
                  <Wallet className="w-3.5 h-3.5" /> Kiralama Geliri ({currency})
                </div>
                <p className="text-2xl font-bold text-orange-700">{formatMoney(amount, currency)}</p>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-2 text-gray-500 text-xs mb-1">
                <Wallet className="w-3.5 h-3.5" /> Kiralama Geliri
              </div>
              <p className="text-2xl font-bold text-gray-400">—</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Per-instructor breakdown */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Eğitmenler</h2>
        {activeInstructorStats.length === 0 ? (
          <div className="text-center py-14 text-gray-400 border rounded-lg">
            <GraduationCap className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>Bu dönemde ders kaydı yok</p>
          </div>
        ) : (
          <div className="space-y-4">
            {activeInstructorStats.map((stat) => (
              <Card key={stat.id}>
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-center justify-between flex-wrap gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-9 h-9 rounded-full flex items-center justify-center text-white font-semibold text-sm flex-shrink-0"
                        style={{ backgroundColor: stat.color }}
                      >
                        {stat.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{stat.name}</p>
                        <div className="flex items-center gap-3 text-xs text-gray-500 mt-0.5">
                          <span className="flex items-center gap-1">
                            <GraduationCap className="w-3 h-3" /> {stat.sessions.length} ders
                          </span>
                          {stat.totalHours > 0 && (
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" /> {stat.totalHours.toFixed(1)} saat
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {Object.entries(stat.earningsByCurrency).length > 0 ? (
                        Object.entries(stat.earningsByCurrency).map(([currency, amount]) => (
                          <Badge key={currency} className="bg-green-100 text-green-700 border-green-200">
                            {formatMoney(amount, currency)}
                          </Badge>
                        ))
                      ) : (
                        <Badge variant="secondary">Kazanç yok</Badge>
                      )}
                    </div>
                  </div>

                  {/* Students summary */}
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {Object.entries(stat.studentCounts).map(([student, count]) => (
                      <span
                        key={student}
                        className="text-xs bg-gray-100 text-gray-600 rounded-full px-2.5 py-1"
                      >
                        {student} {count > 1 ? `×${count}` : ""}
                      </span>
                    ))}
                  </div>

                  {/* Session detail table */}
                  <div className="overflow-x-auto border rounded-lg">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b bg-gray-50">
                          <th className="text-left px-3 py-2 font-medium text-gray-600">Tarih & Saat</th>
                          <th className="text-left px-3 py-2 font-medium text-gray-600">Öğrenci</th>
                          <th className="text-left px-3 py-2 font-medium text-gray-600">Ders</th>
                          <th className="text-right px-3 py-2 font-medium text-gray-600">Tutar</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {stat.sessions.map((s, i) => (
                          <tr key={i} className="hover:bg-gray-50">
                            <td className="px-3 py-2 text-gray-500 whitespace-nowrap">
                              {format(new Date(s.date), "d MMM, HH:mm", { locale: tr })}
                            </td>
                            <td className="px-3 py-2 font-medium text-gray-800">{s.studentName}</td>
                            <td className="px-3 py-2 text-gray-600">{s.title}</td>
                            <td className="px-3 py-2 text-right font-semibold text-gray-900">
                              {s.earned && s.amount > 0 ? formatMoney(s.amount, s.currency) : "—"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            ))}

            {emptyInstructorStats.length > 0 && (
              <p className="text-xs text-gray-400 px-1">
                Bu dönemde dersi olmayan eğitmenler: {emptyInstructorStats.map((s) => s.name).join(", ")}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Per-equipment breakdown */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Ekipman Kiralamaları</h2>
        {activeEquipmentStats.length === 0 ? (
          <div className="text-center py-14 text-gray-400 border rounded-lg">
            <Wrench className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>Bu dönemde kiralama kaydı yok</p>
          </div>
        ) : (
          <div className="space-y-4">
            {activeEquipmentStats.map((stat) => (
              <Card key={stat.id}>
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-center justify-between flex-wrap gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 flex-shrink-0">
                        <Package className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{stat.name}</p>
                        <div className="flex items-center gap-3 text-xs text-gray-500 mt-0.5">
                          <span className="flex items-center gap-1">
                            <Wrench className="w-3 h-3" /> {stat.rentals.length} kiralama
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {Object.entries(stat.revenueByCurrency).length > 0 ? (
                        Object.entries(stat.revenueByCurrency).map(([currency, amount]) => (
                          <Badge key={currency} className="bg-orange-100 text-orange-700 border-orange-200">
                            {formatMoney(amount, currency)}
                          </Badge>
                        ))
                      ) : (
                        <Badge variant="secondary">Gelir yok</Badge>
                      )}
                    </div>
                  </div>

                  {/* Rental detail table */}
                  <div className="overflow-x-auto border rounded-lg">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b bg-gray-50">
                          <th className="text-left px-3 py-2 font-medium text-gray-600">Tarih & Saat</th>
                          <th className="text-left px-3 py-2 font-medium text-gray-600">Müşteri</th>
                          <th className="text-left px-3 py-2 font-medium text-gray-600">Hizmet</th>
                          <th className="text-right px-3 py-2 font-medium text-gray-600">Tutar</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {stat.rentals.map((r, i) => (
                          <tr key={i} className="hover:bg-gray-50">
                            <td className="px-3 py-2 text-gray-500 whitespace-nowrap">
                              {format(new Date(r.date), "d MMM, HH:mm", { locale: tr })}
                            </td>
                            <td className="px-3 py-2 font-medium text-gray-800">{r.studentName}</td>
                            <td className="px-3 py-2 text-gray-600">{r.title}</td>
                            <td className="px-3 py-2 text-right font-semibold text-gray-900">
                              {r.earned && r.amount > 0 ? formatMoney(r.amount, r.currency) : "—"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            ))}

            {emptyEquipmentStats.length > 0 && (
              <p className="text-xs text-gray-400 px-1">
                Bu dönemde kiralanmayan ekipmanlar: {emptyEquipmentStats.map((s) => s.name).join(", ")}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
