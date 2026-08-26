-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Reservation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "studentId" TEXT NOT NULL,
    "instructorId" TEXT NOT NULL,
    "lessonType" TEXT NOT NULL,
    "equipmentId" TEXT,
    "rentalAmount" REAL,
    "rentalCurrency" TEXT,
    "startTime" DATETIME NOT NULL,
    "endTime" DATETIME NOT NULL,
    "plannedHours" REAL NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PLANNED',
    "notes" TEXT,
    "cancelReason" TEXT,
    "createdById" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Reservation_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Reservation_instructorId_fkey" FOREIGN KEY ("instructorId") REFERENCES "Instructor" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Reservation_equipmentId_fkey" FOREIGN KEY ("equipmentId") REFERENCES "Equipment" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Reservation" ("cancelReason", "createdAt", "createdById", "endTime", "id", "instructorId", "isActive", "lessonType", "notes", "plannedHours", "startTime", "status", "studentId", "updatedAt") SELECT "cancelReason", "createdAt", "createdById", "endTime", "id", "instructorId", "isActive", "lessonType", "notes", "plannedHours", "startTime", "status", "studentId", "updatedAt" FROM "Reservation";
DROP TABLE "Reservation";
ALTER TABLE "new_Reservation" RENAME TO "Reservation";
CREATE INDEX "Reservation_instructorId_startTime_idx" ON "Reservation"("instructorId", "startTime");
CREATE INDEX "Reservation_studentId_idx" ON "Reservation"("studentId");
CREATE INDEX "Reservation_startTime_idx" ON "Reservation"("startTime");
CREATE INDEX "Reservation_status_idx" ON "Reservation"("status");
CREATE INDEX "Reservation_equipmentId_idx" ON "Reservation"("equipmentId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
