import { requireAdminOrReception } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CURRENCY_SYMBOLS } from "@/lib/constants";
import { format, startOfDay, endOfDay, startOfWeek, endOfWeek } from "date-fns";
import { tr } from "date-fns/locale";
import { Users, Clock, Wallet, GraduationCap } from "lucide-react";
import { PeriodNav } from "./period-nav";
import Link from "next/link";

function formatMoney(amount: number, currency: string) {
  const symbol = CURRENCY_SYMBOLS[currency as keyof typeof CURRENCY_SYMBOLS] ?? currency;
  return `${symbol}${amount.toFixed(2)}`;
}

type Session = {
  date: Date;
  instructorId: string;
  studentName: string;
  title: string;
  amount: number;
  currency: string;
  hours: number | null;
  earned: boolean;
};

export default async function EgitmenPerformansPage({
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

  const [lessons, hizmetler, instructors] = await Promise.all([
    prisma.lesson.findMany({
      where: { checkInTime: { gte: rangeStart, lte: rangeEnd } },
      include: {
        student: { select: { firstName: true, lastName: true } },
        instructor: { include: { user: { select: { name: true } } } },
        instructorEarning: true,
      },
    }),
    prisma.hizmet.findMany({
      where: {
        category: "EGITIM",
        isActive: true,
        instructorId: { not: null },
        OR: [
          { scheduledAt: { gte: rangeStart, lte: rangeEnd } },
          { scheduledAt: null, createdAt: { gte: rangeStart, lte: rangeEnd } },
        ],
      },
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
  ]);

  const sessions: Session[] = [];

  for (const l of lessons) {
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
  const activeStats = instructorStats.filter((s) => s.sessions.length > 0);
  const emptyStats = instructorStats.filter((s) => s.sessions.length === 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Eğitmen Performansı</h1>
          <p className="text-gray-500 text-sm mt-1">Kim, kiminle, kaç ders yaptı ve ne kazandı</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex border rounded-md overflow-hidden">
            <Link
              href={`/dashboard/egitmen-performans?period=gunluk&date=${format(anchorDate, "yyyy-MM-dd")}`}
              className={`px-3 py-1.5 text-sm font-medium transition-colors ${
                period === "gunluk" ? "bg-blue-600 text-white" : "bg-white text-gray-600 hover:bg-gray-50"
              }`}
            >
              Günlük
            </Link>
            <Link
              href={`/dashboard/egitmen-performans?period=haftalik&date=${format(anchorDate, "yyyy-MM-dd")}`}
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
            <p className="text-2xl font-bold text-gray-900">{activeStats.length}</p>
          </CardContent>
        </Card>
        {Object.entries(grandEarnings).length > 0 ? (
          Object.entries(grandEarnings).map(([currency, amount]) => (
            <Card key={currency} className="border-green-200 bg-green-50">
              <CardContent className="pt-4 pb-4">
                <div className="flex items-center gap-2 text-green-700 text-xs mb-1">
                  <Wallet className="w-3.5 h-3.5" /> Toplam Kazanç ({currency})
                </div>
                <p className="text-2xl font-bold text-green-700">{formatMoney(amount, currency)}</p>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-2 text-gray-500 text-xs mb-1">
                <Wallet className="w-3.5 h-3.5" /> Toplam Kazanç
              </div>
              <p className="text-2xl font-bold text-gray-400">—</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Per-instructor breakdown */}
      {activeStats.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <GraduationCap className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p>Bu dönemde ders kaydı yok</p>
        </div>
      ) : (
        <div className="space-y-4">
          {activeStats.map((stat) => (
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

          {emptyStats.length > 0 && (
            <p className="text-xs text-gray-400 px-1">
              Bu dönemde dersi olmayan eğitmenler: {emptyStats.map((s) => s.name).join(", ")}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
