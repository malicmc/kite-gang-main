-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Hizmet" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "category" TEXT NOT NULL,
    "sablonId" TEXT,
    "studentId" TEXT,
    "instructorId" TEXT,
    "equipmentId" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "amount" REAL NOT NULL DEFAULT 0,
    "currency" TEXT NOT NULL DEFAULT 'EUR',
    "quantity" INTEGER,
    "paymentMethod" TEXT,
    "instructorEarning" REAL,
    "status" TEXT NOT NULL DEFAULT 'BEKLIYOR',
    "scheduledAt" DATETIME,
    "checkedInAt" DATETIME,
    "checkedOutAt" DATETIME,
    "notes" TEXT,
    "createdById" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Hizmet_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Hizmet_instructorId_fkey" FOREIGN KEY ("instructorId") REFERENCES "Instructor" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Hizmet_equipmentId_fkey" FOREIGN KEY ("equipmentId") REFERENCES "Equipment" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Hizmet" ("amount", "category", "checkedInAt", "checkedOutAt", "createdAt", "createdById", "currency", "description", "id", "instructorEarning", "instructorId", "isActive", "notes", "paymentMethod", "quantity", "sablonId", "scheduledAt", "status", "studentId", "title", "updatedAt") SELECT "amount", "category", "checkedInAt", "checkedOutAt", "createdAt", "createdById", "currency", "description", "id", "instructorEarning", "instructorId", "isActive", "notes", "paymentMethod", "quantity", "sablonId", "scheduledAt", "status", "studentId", "title", "updatedAt" FROM "Hizmet";
DROP TABLE "Hizmet";
ALTER TABLE "new_Hizmet" RENAME TO "Hizmet";
CREATE INDEX "Hizmet_category_idx" ON "Hizmet"("category");
CREATE INDEX "Hizmet_studentId_idx" ON "Hizmet"("studentId");
CREATE INDEX "Hizmet_instructorId_idx" ON "Hizmet"("instructorId");
CREATE INDEX "Hizmet_equipmentId_idx" ON "Hizmet"("equipmentId");
CREATE INDEX "Hizmet_status_idx" ON "Hizmet"("status");
CREATE INDEX "Hizmet_scheduledAt_idx" ON "Hizmet"("scheduledAt");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
