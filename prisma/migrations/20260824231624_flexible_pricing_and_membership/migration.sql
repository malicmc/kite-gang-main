/*
  Warnings:

  - You are about to drop the column `currency` on the `HizmetSablonu` table. All the data in the column will be lost.
  - You are about to drop the column `defaultPrice` on the `HizmetSablonu` table. All the data in the column will be lost.
  - You are about to drop the column `fullDayPrice` on the `HizmetSablonu` table. All the data in the column will be lost.
  - You are about to drop the column `halfDayPrice` on the `HizmetSablonu` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Hizmet" ADD COLUMN "quantity" INTEGER;

-- CreateTable
CREATE TABLE "HizmetFiyat" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sablonId" TEXT NOT NULL,
    "zamanBirimi" TEXT NOT NULL,
    "currency" TEXT NOT NULL,
    "price" REAL NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "HizmetFiyat_sablonId_fkey" FOREIGN KEY ("sablonId") REFERENCES "HizmetSablonu" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_HizmetSablonu" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "category" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "validityDays" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_HizmetSablonu" ("category", "createdAt", "id", "isActive", "name", "sortOrder", "updatedAt") SELECT "category", "createdAt", "id", "isActive", "name", "sortOrder", "updatedAt" FROM "HizmetSablonu";
DROP TABLE "HizmetSablonu";
ALTER TABLE "new_HizmetSablonu" RENAME TO "HizmetSablonu";
CREATE INDEX "HizmetSablonu_category_idx" ON "HizmetSablonu"("category");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "HizmetFiyat_sablonId_idx" ON "HizmetFiyat"("sablonId");
