import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const url = process.env.DATABASE_URL ?? "file:./dev.db";
const adapter = new PrismaBetterSqlite3({ url });
const prisma = new PrismaClient({ adapter } as any);

const sablonlar = [
  // Eğitim (Seanslar)
  { category: "EGITIM", name: "Kitesurf Özel Ders", subCategory: "Kitesurf", requiredPeople: 1, description: "Bire bir eğitmen eşliğinde kişiye özel kitesurf dersi", onlineVisibility: "LISTED", sortOrder: 1, fiyatlar: [{ zamanBirimi: "SABIT", currency: "EUR", price: 80 }] },
  { category: "EGITIM", name: "Kitesurf Grup Ders", subCategory: "Kitesurf", requiredPeople: 2, description: "2 kişilik grup dersi, ekipman dahil", onlineVisibility: "LISTED", sortOrder: 2, fiyatlar: [{ zamanBirimi: "SABIT", currency: "EUR", price: 40 }] },
  { category: "EGITIM", name: "AllRide Kitesurf Özel Ders", subCategory: "Kitesurf", requiredPeople: 1, description: "İleri seviye allride teknikleri, özel ders", onlineVisibility: "PARTNER_ONLY", sortOrder: 3, fiyatlar: [{ zamanBirimi: "SABIT", currency: "TRY", price: 3500 }] },
  // Kiralama
  { category: "KIRALAMA", name: "Ekipman Tam Gün",   subCategory: "Ekipman",  description: "Kite, board ve harness dahil tam ekipman kiralama (tam gün)", onlineVisibility: "LISTED", sortOrder: 1, fiyatlar: [{ zamanBirimi: "TAM_GUN", currency: "EUR", price: 50 }] },
  { category: "KIRALAMA", name: "Ekipman Yarım Gün", subCategory: "Ekipman",  description: "Yarım günlük ekipman kiralama (4 saat)", onlineVisibility: "LISTED", sortOrder: 2, fiyatlar: [{ zamanBirimi: "YARIM_GUN", currency: "EUR", price: 30 }] },
  { category: "KIRALAMA", name: "Storage Haftalık",  subCategory: "Depolama", description: "Ekipmanınızı bir hafta boyunca okulda güvenle saklayın", onlineVisibility: "LISTED", sortOrder: 3, fiyatlar: [{ zamanBirimi: "SABIT", currency: "EUR", price: 60 }] },
  { category: "KIRALAMA", name: "Storage Günlük",    subCategory: "Depolama", description: "Ekipmanınızı günlük olarak okulda güvenle saklayın", onlineVisibility: "LISTED", sortOrder: 4, fiyatlar: [{ zamanBirimi: "SABIT", currency: "EUR", price: 10 }] },
  // Satılabilir Ürün
  { category: "URUN", name: "Kitesurf Tişört",  subCategory: "Mağaza", description: "Nefes alabilen kumaştan baskılı tişört", onlineVisibility: "LISTED", sortOrder: 1, fiyatlar: [{ zamanBirimi: "SABIT", currency: "EUR", price: 25 }] },
  { category: "URUN", name: "Su Şişesi",        subCategory: "Mağaza", description: "Kite Gang Corner logolu 750ml suluk", onlineVisibility: "LISTED", sortOrder: 2, fiyatlar: [{ zamanBirimi: "SABIT", currency: "EUR", price: 8 }] },
  { category: "URUN", name: "Kitesurf Şapka",   subCategory: "Mağaza", description: "UV korumalı şapka", onlineVisibility: "LISTED", sortOrder: 3, fiyatlar: [{ zamanBirimi: "SABIT", currency: "EUR", price: 15 }] },
  // Üyelik
  {
    category: "UYELIK",
    name: "Yıllık Üyelik",
    subCategory: "Üyelik",
    description: "1 yıl boyunca üyelik avantajları ve indirimli ders fiyatları",
    onlineVisibility: "LISTED",
    sortOrder: 1,
    validityDays: 365,
    fiyatlar: [
      { zamanBirimi: "SABIT", currency: "EUR", price: 350 },
      { zamanBirimi: "SABIT", currency: "TRY", price: 12000 },
    ],
  },
  {
    category: "UYELIK",
    name: "Aylık Üyelik",
    subCategory: "Üyelik",
    description: "1 ay boyunca üyelik avantajları ve indirimli ders fiyatları",
    onlineVisibility: "LISTED",
    sortOrder: 2,
    validityDays: 30,
    fiyatlar: [{ zamanBirimi: "SABIT", currency: "EUR", price: 40 }],
  },
  // Etkinlik
  { category: "ETKINLIK", name: "Hafta Sonu Kitesurf Kampı", subCategory: "Kamp", requiredPeople: 4, description: "2 günlük grup kampı, konaklama hariç", onlineVisibility: "LISTED", sortOrder: 1, fiyatlar: [{ zamanBirimi: "SABIT", currency: "EUR", price: 180 }] },
  { category: "ETKINLIK", name: "Kitesurf Yarışması", subCategory: "Yarışma", requiredPeople: 6, description: "Yıl sonu okul içi yarışma etkinliği", onlineVisibility: "PARTNER_ONLY", sortOrder: 2, fiyatlar: [{ zamanBirimi: "SABIT", currency: "EUR", price: 25 }] },
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
          subCategory: (s as any).subCategory ?? null,
          requiredPeople: (s as any).requiredPeople ?? null,
          description: (s as any).description ?? null,
          onlineVisibility: (s as any).onlineVisibility ?? "LISTED",
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
