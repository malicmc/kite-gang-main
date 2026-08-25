-- CreateTable
CREATE TABLE "HizmetSablonu" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "category" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "defaultPrice" REAL NOT NULL DEFAULT 0,
    "halfDayPrice" REAL,
    "fullDayPrice" REAL,
    "currency" TEXT NOT NULL DEFAULT 'EUR',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Hizmet" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "category" TEXT NOT NULL,
    "sablonId" TEXT,
    "studentId" TEXT,
    "instructorId" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "amount" REAL NOT NULL DEFAULT 0,
    "currency" TEXT NOT NULL DEFAULT 'EUR',
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
    CONSTRAINT "Hizmet_instructorId_fkey" FOREIGN KEY ("instructorId") REFERENCES "Instructor" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "HizmetSablonu_category_idx" ON "HizmetSablonu"("category");

-- CreateIndex
CREATE INDEX "Hizmet_category_idx" ON "Hizmet"("category");

-- CreateIndex
CREATE INDEX "Hizmet_studentId_idx" ON "Hizmet"("studentId");

-- CreateIndex
CREATE INDEX "Hizmet_instructorId_idx" ON "Hizmet"("instructorId");

-- CreateIndex
CREATE INDEX "Hizmet_status_idx" ON "Hizmet"("status");

-- CreateIndex
CREATE INDEX "Hizmet_scheduledAt_idx" ON "Hizmet"("scheduledAt");
