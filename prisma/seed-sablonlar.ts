import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const url = process.env.DATABASE_URL ?? "file:./dev.db";
const adapter = new PrismaBetterSqlite3({ url });
const prisma = new PrismaClient({ adapter } as any);

const sablonlar = [
  // Eğitim
  { category: "EGITIM", name: "Özel Ders",    sortOrder: 1, fiyatlar: [{ zamanBirimi: "SABIT", currency: "EUR", price: 80 }] },
  { category: "EGITIM", name: "Grup Dersi",    sortOrder: 2, fiyatlar: [{ zamanBirimi: "SABIT", currency: "EUR", price: 40 }] },
  { category: "EGITIM", name: "Allride Ders",  sortOrder: 3, fiyatlar: [{ zamanBirimi: "SABIT", currency: "EUR", price: 60 }] },
  // Kiralama
  { category: "KIRALAMA", name: "Ekipman Tam Gün",   sortOrder: 1, fiyatlar: [{ zamanBirimi: "TAM_GUN", currency: "EUR", price: 50 }] },
  { category: "KIRALAMA", name: "Ekipman Yarım Gün", sortOrder: 2, fiyatlar: [{ zamanBirimi: "YARIM_GUN", currency: "EUR", price: 30 }] },
  { category: "KIRALAMA", name: "Storage Haftalık",  sortOrder: 3, fiyatlar: [{ zamanBirimi: "SABIT", currency: "EUR", price: 60 }] },
  { category: "KIRALAMA", name: "Storage Günlük",    sortOrder: 4, fiyatlar: [{ zamanBirimi: "SABIT", currency: "EUR", price: 10 }] },
  // Satılabilir Ürün
  { category: "URUN", name: "Kitesurf Tişört",  sortOrder: 1, fiyatlar: [{ zamanBirimi: "SABIT", currency: "EUR", price: 25 }] },
  { category: "URUN", name: "Su Şişesi",        sortOrder: 2, fiyatlar: [{ zamanBirimi: "SABIT", currency: "EUR", price: 8 }] },
  // Üyelik
  {
    category: "UYELIK",
    name: "Yıllık Üyelik",
    sortOrder: 1,
    validityDays: 365,
    fiyatlar: [
      { zamanBirimi: "SABIT", currency: "EUR", price: 350 },
      { zamanBirimi: "SABIT", currency: "TRY", price: 12000 },
    ],
  },
];

async function main() {
  for (const s of sablonlar) {
    const existing = await prisma.hizmetSablonu.findFirst({
      where: { category: s.category, name: s.name },
    });
    if (!existing) {
      await prisma.hizmetSablonu.create({
        data: {
          category: s.category,
          name: s.name,
          sortOrder: s.sortOrder,
          validityDays: (s as any).validityDays ?? null,
          fiyatlar: { createMany: { data: s.fiyatlar } },
        },
      });
      console.log(`✓ ${s.category} — ${s.name}`);
    } else {
      console.log(`  Mevcut: ${s.category} — ${s.name}`);
    }
  }
  console.log("Tamamlandı.");
}

main().catch(console.error).finally(() => prisma.$disconnect());
