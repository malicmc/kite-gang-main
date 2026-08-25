import { requireAdminOrReception } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GraduationCap, Wrench, ShoppingBag, Repeat } from "lucide-react";
import { CURRENCY_SYMBOLS, ZAMAN_BIRIMLERI } from "@/lib/constants";
import { NewSablonDialog } from "./new-sablon-dialog";
import { EditSablonDialog } from "./edit-sablon-dialog";

const CAT = {
  EGITIM:  { label: "Eğitim",           icon: GraduationCap, color: "text-blue-600",   bg: "bg-blue-50",   border: "border-blue-200" },
  KIRALAMA:{ label: "Kiralama",         icon: Wrench,         color: "text-orange-600", bg: "bg-orange-50", border: "border-orange-200" },
  URUN:    { label: "Satılabilir Ürün", icon: ShoppingBag,    color: "text-green-600",  bg: "bg-green-50",  border: "border-green-200" },
  UYELIK:  { label: "Üyelik",           icon: Repeat,         color: "text-purple-600", bg: "bg-purple-50", border: "border-purple-200" },
} as const;

export default async function HizmetlerPage() {
  await requireAdminOrReception();

  const sablonlar = await prisma.hizmetSablonu.findMany({
    where: { isActive: true },
    include: { fiyatlar: true },
    orderBy: [{ category: "asc" }, { sortOrder: "asc" }],
  });

  const grouped = {
    EGITIM:   sablonlar.filter((s) => s.category === "EGITIM"),
    KIRALAMA: sablonlar.filter((s) => s.category === "KIRALAMA"),
    URUN:     sablonlar.filter((s) => s.category === "URUN"),
    UYELIK:   sablonlar.filter((s) => s.category === "UYELIK"),
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Hizmetler</h1>
        <p className="text-gray-500 text-sm mt-1">
          Sunduğunuz hizmet türleri ve varsayılan fiyatları. Müşteriye atamak için müşteri profilini kullanın.
        </p>
      </div>

      {(Object.entries(grouped) as [keyof typeof CAT, typeof sablonlar][]).map(([cat, items]) => {
        const meta = CAT[cat];
        const Icon = meta.icon;
        return (
          <Card key={cat}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className={`text-base flex items-center gap-2 ${meta.color}`}>
                  <Icon className="w-4 h-4" />
                  {meta.label}
                </CardTitle>
                <NewSablonDialog category={cat} categoryLabel={meta.label} />
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {items.length === 0 ? (
                <p className="text-sm text-gray-400 px-4 pb-4">Henüz hizmet eklenmemiş</p>
              ) : (
                <div className="divide-y">
                  {items.map((s) => {
                    const byUnit = new Map<string, typeof s.fiyatlar>();
                    for (const f of s.fiyatlar) {
                      if (!byUnit.has(f.zamanBirimi)) byUnit.set(f.zamanBirimi, []);
                      byUnit.get(f.zamanBirimi)!.push(f);
                    }
                    return (
                      <div key={s.id} className="flex items-center justify-between px-4 py-3">
                        <div>
                          <p className="font-medium text-sm text-gray-900">
                            {s.name}
                            {s.category === "UYELIK" && s.validityDays && (
                              <span className="text-xs text-gray-400 font-normal ml-2">({s.validityDays} gün geçerli)</span>
                            )}
                          </p>
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-0.5 text-xs text-gray-400">
                            {byUnit.size === 0 && <span>Fiyat belirlenmemiş</span>}
                            {[...byUnit.entries()].map(([unit, rows]) => (
                              <span key={unit}>
                                {ZAMAN_BIRIMLERI[unit as keyof typeof ZAMAN_BIRIMLERI]}:{" "}
                                {rows
                                  .map((r) => `${CURRENCY_SYMBOLS[r.currency as keyof typeof CURRENCY_SYMBOLS] ?? r.currency}${r.price.toFixed(2)}`)
                                  .join(" · ")}
                              </span>
                            ))}
                          </div>
                        </div>
                        <EditSablonDialog sablon={s} />
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
