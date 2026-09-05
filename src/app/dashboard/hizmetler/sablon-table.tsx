import { prisma } from "@/lib/prisma";
import { ZAMAN_BIRIMLERI } from "@/lib/constants";
import { NewSablonDialog } from "./new-sablon-dialog";
import { SablonRowActions } from "./sablon-row-actions";
import { SablonFilters } from "./sablon-filters";
import { Search } from "lucide-react";
import { formatTRY } from "@/lib/currency";
import { getExchangeRates } from "@/lib/exchange-rates";

const AVATAR_COLORS = [
  "bg-teal-100 text-teal-700",
  "bg-lime-100 text-lime-700",
  "bg-slate-200 text-slate-600",
  "bg-amber-100 text-amber-700",
  "bg-blue-100 text-blue-700",
  "bg-violet-100 text-violet-700",
];

const VISIBILITY_STYLE: Record<string, string> = {
  LISTED: "bg-emerald-50 text-emerald-700",
  PARTNER_ONLY: "bg-slate-100 text-slate-600",
  HIDDEN: "bg-gray-100 text-gray-400",
};

const VISIBILITY_LABEL: Record<string, string> = {
  LISTED: "Online listelenir",
  PARTNER_ONLY: "Yalnızca Partner Paneli",
  HIDDEN: "Gizli",
};

function initialsOf(name: string) {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "?";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}

export async function SablonTable({
  category,
  label,
  itemLabel,
  searchParams,
}: {
  category: "EGITIM" | "KIRALAMA" | "URUN" | "UYELIK" | "ETKINLIK";
  label: string;
  itemLabel: string;
  searchParams: { q?: string; aktif?: string; gorunurluk?: string };
}) {
  const q = searchParams.q ?? "";
  const aktif = searchParams.aktif ?? "aktif";
  const gorunurluk = searchParams.gorunurluk ?? "tumu";

  const [sablonlar, rates] = await Promise.all([
    prisma.hizmetSablonu.findMany({
      where: {
        category,
        ...(aktif === "aktif" ? { isActive: true } : aktif === "pasif" ? { isActive: false } : {}),
        ...(gorunurluk !== "tumu" ? { onlineVisibility: gorunurluk } : {}),
        ...(q ? { name: { contains: q } } : {}),
      },
      include: { fiyatlar: true },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    }),
    getExchangeRates(),
  ]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-end">
        <NewSablonDialog category={category} categoryLabel={label} triggerLabel={`Yeni ${itemLabel}`} variant="default" />
      </div>

      <SablonFilters q={q} aktif={aktif} gorunurluk={gorunurluk} searchPlaceholder={`${itemLabel} ara`} />

      <div className="bg-white rounded-xl border overflow-hidden">
        {sablonlar.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>Kayıt bulunamadı</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="text-left px-4 py-3 font-medium text-gray-600">{itemLabel}</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Kategori</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Gerekli Kişi Sayısı</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Açıklama</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">
                    {category === "URUN" ? "Fiyat" : "Fiyat (Kişi Başı)"}
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Online Uygunluk</th>
                  <th className="w-10"></th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {sablonlar.map((s, idx) => {
                  const byUnit = new Map<string, typeof s.fiyatlar>();
                  for (const f of s.fiyatlar) {
                    if (!byUnit.has(f.zamanBirimi)) byUnit.set(f.zamanBirimi, []);
                    byUnit.get(f.zamanBirimi)!.push(f);
                  }
                  return (
                    <tr key={s.id} className={`hover:bg-gray-50 ${!s.isActive ? "opacity-50" : ""}`}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-semibold flex-shrink-0 ${AVATAR_COLORS[idx % AVATAR_COLORS.length]}`}>
                            {initialsOf(s.name)}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{s.name}</p>
                            {category === "UYELIK" && s.validityDays && (
                              <p className="text-xs text-gray-400">{s.validityDays} gün geçerli</p>
                            )}
                            {!s.isActive && (
                              <p className="text-xs text-gray-400">Pasif</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{s.subCategory ?? "-"}</td>
                      <td className="px-4 py-3 text-gray-600">{s.requiredPeople ?? "-"}</td>
                      <td className="px-4 py-3 text-gray-500 max-w-[220px] truncate">{s.description ?? "-"}</td>
                      <td className="px-4 py-3">
                        {byUnit.size === 0 ? (
                          <span className="text-gray-400 text-xs">Fiyat belirlenmemiş</span>
                        ) : (
                          <div className="space-y-1">
                            {[...byUnit.entries()].map(([unit, rows]) => (
                              <div key={unit}>
                                <p className="font-semibold text-gray-900">
                                  {rows
                                    .map((r) => formatTRY(r.price, r.currency, rates))
                                    .join(" · ")}
                                </p>
                                <p className="text-xs text-gray-400">{ZAMAN_BIRIMLERI[unit as keyof typeof ZAMAN_BIRIMLERI]}</p>
                              </div>
                            ))}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex px-2 py-1 rounded-md text-xs font-medium ${VISIBILITY_STYLE[s.onlineVisibility] ?? VISIBILITY_STYLE.LISTED}`}>
                          {VISIBILITY_LABEL[s.onlineVisibility] ?? s.onlineVisibility}
                        </span>
                      </td>
                      <td className="px-2 py-3 text-right">
                        <SablonRowActions sablon={s} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        {sablonlar.length > 0 && (
          <div className="flex items-center justify-end px-4 py-2.5 border-t text-xs text-gray-400">
            1–{sablonlar.length} / {sablonlar.length} kayıt
          </div>
        )}
      </div>
    </div>
  );
}
