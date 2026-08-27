-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Lesson" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "reservationId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "instructorId" TEXT,
    "purchaseId" TEXT,
    "actualHours" REAL,
    "checkInTime" DATETIME NOT NULL,
    "checkOutTime" DATETIME,
    "kiteSize" TEXT,
    "boardType" TEXT,
    "harness" BOOLEAN NOT NULL DEFAULT false,
    "wetsuit" BOOLEAN NOT NULL DEFAULT false,
    "equipmentNotes" TEXT,
    "instructorNotes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Lesson_reservationId_fkey" FOREIGN KEY ("reservationId") REFERENCES "Reservation" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Lesson_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Lesson_instructorId_fkey" FOREIGN KEY ("instructorId") REFERENCES "Instructor" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Lesson_purchaseId_fkey" FOREIGN KEY ("purchaseId") REFERENCES "PackagePurchase" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Lesson" ("actualHours", "boardType", "checkInTime", "checkOutTime", "createdAt", "equipmentNotes", "harness", "id", "instructorId", "instructorNotes", "kiteSize", "purchaseId", "reservationId", "studentId", "updatedAt", "wetsuit") SELECT "actualHours", "boardType", "checkInTime", "checkOutTime", "createdAt", "equipmentNotes", "harness", "id", "instructorId", "instructorNotes", "kiteSize", "purchaseId", "reservationId", "studentId", "updatedAt", "wetsuit" FROM "Lesson";
DROP TABLE "Lesson";
ALTER TABLE "new_Lesson" RENAME TO "Lesson";
CREATE UNIQUE INDEX "Lesson_reservationId_key" ON "Lesson"("reservationId");
CREATE INDEX "Lesson_instructorId_idx" ON "Lesson"("instructorId");
CREATE INDEX "Lesson_studentId_idx" ON "Lesson"("studentId");
CREATE INDEX "Lesson_checkInTime_idx" ON "Lesson"("checkInTime");
CREATE TABLE "new_Reservation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "studentId" TEXT NOT NULL,
    "instructorId" TEXT,
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
    CONSTRAINT "Reservation_instructorId_fkey" FOREIGN KEY ("instructorId") REFERENCES "Instructor" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Reservation_equipmentId_fkey" FOREIGN KEY ("equipmentId") REFERENCES "Equipment" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Reservation" ("cancelReason", "createdAt", "createdById", "endTime", "equipmentId", "id", "instructorId", "isActive", "lessonType", "notes", "plannedHours", "rentalAmount", "rentalCurrency", "startTime", "status", "studentId", "updatedAt") SELECT "cancelReason", "createdAt", "createdById", "endTime", "equipmentId", "id", "instructorId", "isActive", "lessonType", "notes", "plannedHours", "rentalAmount", "rentalCurrency", "startTime", "status", "studentId", "updatedAt" FROM "Reservation";
DROP TABLE "Reservation";
ALTER TABLE "new_Reservation" RENAME TO "Reservation";
CREATE INDEX "Reservation_instructorId_startTime_idx" ON "Reservation"("instructorId", "startTime");
CREATE INDEX "Reservation_studentId_idx" ON "Reservation"("studentId");
CREATE INDEX "Reservation_startTime_idx" ON "Reservation"("startTime");
CREATE INDEX "Reservation_status_idx" ON "Reservation"("status");
CREATE INDEX "Reservation_equipmentId_idx" ON "Reservation"("equipmentId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
