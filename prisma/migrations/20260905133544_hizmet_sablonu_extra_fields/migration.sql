-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_HizmetSablonu" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "category" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "subCategory" TEXT,
    "requiredPeople" INTEGER,
    "description" TEXT,
    "onlineVisibility" TEXT NOT NULL DEFAULT 'LISTED',
    "validityDays" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_HizmetSablonu" ("category", "createdAt", "id", "isActive", "name", "sortOrder", "updatedAt", "validityDays") SELECT "category", "createdAt", "id", "isActive", "name", "sortOrder", "updatedAt", "validityDays" FROM "HizmetSablonu";
DROP TABLE "HizmetSablonu";
ALTER TABLE "new_HizmetSablonu" RENAME TO "HizmetSablonu";
CREATE INDEX "HizmetSablonu_category_idx" ON "HizmetSablonu"("category");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
