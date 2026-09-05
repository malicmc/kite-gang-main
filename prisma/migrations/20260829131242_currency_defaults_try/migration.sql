-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_CashAccount" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "accountType" TEXT NOT NULL DEFAULT 'CASH',
    "currency" TEXT NOT NULL DEFAULT 'TRY',
    "balance" REAL NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_CashAccount" ("accountType", "balance", "createdAt", "currency", "id", "isActive", "name", "updatedAt") SELECT "accountType", "balance", "createdAt", "currency", "id", "isActive", "name", "updatedAt" FROM "CashAccount";
DROP TABLE "CashAccount";
ALTER TABLE "new_CashAccount" RENAME TO "CashAccount";
CREATE INDEX "CashAccount_accountType_currency_idx" ON "CashAccount"("accountType", "currency");
CREATE TABLE "new_CashRegisterEntry" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "accountId" TEXT NOT NULL,
    "entryType" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'TRY',
    "description" TEXT NOT NULL,
    "paymentId" TEXT,
    "expenseId" TEXT,
    "payoutId" TEXT,
    "recordedById" TEXT,
    "recordedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CashRegisterEntry_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "CashAccount" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "CashRegisterEntry_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "Payment" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "CashRegisterEntry_expenseId_fkey" FOREIGN KEY ("expenseId") REFERENCES "Expense" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "CashRegisterEntry_payoutId_fkey" FOREIGN KEY ("payoutId") REFERENCES "InstructorPayout" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_CashRegisterEntry" ("accountId", "amount", "createdAt", "currency", "description", "entryType", "expenseId", "id", "paymentId", "payoutId", "recordedAt", "recordedById") SELECT "accountId", "amount", "createdAt", "currency", "description", "entryType", "expenseId", "id", "paymentId", "payoutId", "recordedAt", "recordedById" FROM "CashRegisterEntry";
DROP TABLE "CashRegisterEntry";
ALTER TABLE "new_CashRegisterEntry" RENAME TO "CashRegisterEntry";
CREATE UNIQUE INDEX "CashRegisterEntry_paymentId_key" ON "CashRegisterEntry"("paymentId");
CREATE UNIQUE INDEX "CashRegisterEntry_expenseId_key" ON "CashRegisterEntry"("expenseId");
CREATE UNIQUE INDEX "CashRegisterEntry_payoutId_key" ON "CashRegisterEntry"("payoutId");
CREATE INDEX "CashRegisterEntry_accountId_idx" ON "CashRegisterEntry"("accountId");
CREATE INDEX "CashRegisterEntry_recordedAt_idx" ON "CashRegisterEntry"("recordedAt");
CREATE TABLE "new_Expense" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "category" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'TRY',
    "method" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "receiptUrl" TEXT,
    "expenseDate" DATETIME NOT NULL,
    "recordedById" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Expense" ("amount", "category", "createdAt", "currency", "description", "expenseDate", "id", "isActive", "method", "receiptUrl", "recordedById", "updatedAt") SELECT "amount", "category", "createdAt", "currency", "description", "expenseDate", "id", "isActive", "method", "receiptUrl", "recordedById", "updatedAt" FROM "Expense";
DROP TABLE "Expense";
ALTER TABLE "new_Expense" RENAME TO "Expense";
CREATE INDEX "Expense_expenseDate_idx" ON "Expense"("expenseDate");
CREATE INDEX "Expense_category_idx" ON "Expense"("category");
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
    "currency" TEXT NOT NULL DEFAULT 'TRY',
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
INSERT INTO "new_Hizmet" ("amount", "category", "checkedInAt", "checkedOutAt", "createdAt", "createdById", "currency", "description", "equipmentId", "id", "instructorEarning", "instructorId", "isActive", "notes", "paymentMethod", "quantity", "sablonId", "scheduledAt", "status", "studentId", "title", "updatedAt") SELECT "amount", "category", "checkedInAt", "checkedOutAt", "createdAt", "createdById", "currency", "description", "equipmentId", "id", "instructorEarning", "instructorId", "isActive", "notes", "paymentMethod", "quantity", "sablonId", "scheduledAt", "status", "studentId", "title", "updatedAt" FROM "Hizmet";
DROP TABLE "Hizmet";
ALTER TABLE "new_Hizmet" RENAME TO "Hizmet";
CREATE INDEX "Hizmet_category_idx" ON "Hizmet"("category");
CREATE INDEX "Hizmet_studentId_idx" ON "Hizmet"("studentId");
CREATE INDEX "Hizmet_instructorId_idx" ON "Hizmet"("instructorId");
CREATE INDEX "Hizmet_equipmentId_idx" ON "Hizmet"("equipmentId");
CREATE INDEX "Hizmet_status_idx" ON "Hizmet"("status");
CREATE INDEX "Hizmet_scheduledAt_idx" ON "Hizmet"("scheduledAt");
CREATE TABLE "new_Instructor" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "phone" TEXT,
    "paymentModel" TEXT NOT NULL DEFAULT 'HOURLY_RATE',
    "hourlyRate" REAL,
    "hourlyRateCurrency" TEXT NOT NULL DEFAULT 'TRY',
    "revenueShare" REAL,
    "monthlySalary" REAL,
    "salaryCurrency" TEXT NOT NULL DEFAULT 'TRY',
    "color" TEXT NOT NULL DEFAULT '#3B82F6',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Instructor_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Instructor" ("color", "createdAt", "hourlyRate", "hourlyRateCurrency", "id", "isActive", "monthlySalary", "paymentModel", "phone", "revenueShare", "salaryCurrency", "updatedAt", "userId") SELECT "color", "createdAt", "hourlyRate", "hourlyRateCurrency", "id", "isActive", "monthlySalary", "paymentModel", "phone", "revenueShare", "salaryCurrency", "updatedAt", "userId" FROM "Instructor";
DROP TABLE "Instructor";
ALTER TABLE "new_Instructor" RENAME TO "Instructor";
CREATE UNIQUE INDEX "Instructor_userId_key" ON "Instructor"("userId");
CREATE INDEX "Instructor_userId_idx" ON "Instructor"("userId");
CREATE TABLE "new_InstructorEarning" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "instructorId" TEXT NOT NULL,
    "lessonId" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'TRY',
    "hours" REAL NOT NULL,
    "isPaid" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "InstructorEarning_instructorId_fkey" FOREIGN KEY ("instructorId") REFERENCES "Instructor" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "InstructorEarning_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_InstructorEarning" ("amount", "createdAt", "currency", "hours", "id", "instructorId", "isPaid", "lessonId", "updatedAt") SELECT "amount", "createdAt", "currency", "hours", "id", "instructorId", "isPaid", "lessonId", "updatedAt" FROM "InstructorEarning";
DROP TABLE "InstructorEarning";
ALTER TABLE "new_InstructorEarning" RENAME TO "InstructorEarning";
CREATE UNIQUE INDEX "InstructorEarning_lessonId_key" ON "InstructorEarning"("lessonId");
CREATE INDEX "InstructorEarning_instructorId_idx" ON "InstructorEarning"("instructorId");
CREATE INDEX "InstructorEarning_isPaid_idx" ON "InstructorEarning"("isPaid");
CREATE TABLE "new_InstructorPayout" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "instructorId" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'TRY',
    "method" TEXT NOT NULL,
    "periodStart" DATETIME,
    "periodEnd" DATETIME,
    "notes" TEXT,
    "paidAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "recordedById" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "InstructorPayout_instructorId_fkey" FOREIGN KEY ("instructorId") REFERENCES "Instructor" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_InstructorPayout" ("amount", "createdAt", "currency", "id", "instructorId", "method", "notes", "paidAt", "periodEnd", "periodStart", "recordedById", "updatedAt") SELECT "amount", "createdAt", "currency", "id", "instructorId", "method", "notes", "paidAt", "periodEnd", "periodStart", "recordedById", "updatedAt" FROM "InstructorPayout";
DROP TABLE "InstructorPayout";
ALTER TABLE "new_InstructorPayout" RENAME TO "InstructorPayout";
CREATE INDEX "InstructorPayout_instructorId_idx" ON "InstructorPayout"("instructorId");
CREATE TABLE "new_LessonPackage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "lessonType" TEXT NOT NULL,
    "totalHours" REAL NOT NULL,
    "price" REAL NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'TRY',
    "validityDays" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_LessonPackage" ("createdAt", "currency", "description", "id", "isActive", "lessonType", "name", "price", "totalHours", "updatedAt", "validityDays") SELECT "createdAt", "currency", "description", "id", "isActive", "lessonType", "name", "price", "totalHours", "updatedAt", "validityDays" FROM "LessonPackage";
DROP TABLE "LessonPackage";
ALTER TABLE "new_LessonPackage" RENAME TO "LessonPackage";
CREATE INDEX "LessonPackage_isActive_idx" ON "LessonPackage"("isActive");
CREATE TABLE "new_PackagePurchase" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "studentId" TEXT NOT NULL,
    "packageId" TEXT NOT NULL,
    "totalHours" REAL NOT NULL,
    "remainingHours" REAL NOT NULL,
    "purchasePrice" REAL NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'TRY',
    "purchasedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" DATETIME,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "PackagePurchase_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "PackagePurchase_packageId_fkey" FOREIGN KEY ("packageId") REFERENCES "LessonPackage" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_PackagePurchase" ("createdAt", "currency", "expiresAt", "id", "isActive", "packageId", "purchasePrice", "purchasedAt", "remainingHours", "studentId", "totalHours", "updatedAt") SELECT "createdAt", "currency", "expiresAt", "id", "isActive", "packageId", "purchasePrice", "purchasedAt", "remainingHours", "studentId", "totalHours", "updatedAt" FROM "PackagePurchase";
DROP TABLE "PackagePurchase";
ALTER TABLE "new_PackagePurchase" RENAME TO "PackagePurchase";
CREATE INDEX "PackagePurchase_studentId_idx" ON "PackagePurchase"("studentId");
CREATE INDEX "PackagePurchase_packageId_idx" ON "PackagePurchase"("packageId");
CREATE TABLE "new_Payment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "studentId" TEXT,
    "purchaseId" TEXT,
    "hizmetId" TEXT,
    "amount" REAL NOT NULL,
    "kasaAmount" REAL,
    "currency" TEXT NOT NULL DEFAULT 'TRY',
    "method" TEXT NOT NULL,
    "direction" TEXT NOT NULL DEFAULT 'INCOMING',
    "description" TEXT,
    "recordedById" TEXT,
    "recordedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Payment_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Payment_purchaseId_fkey" FOREIGN KEY ("purchaseId") REFERENCES "PackagePurchase" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Payment_hizmetId_fkey" FOREIGN KEY ("hizmetId") REFERENCES "Hizmet" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Payment" ("amount", "createdAt", "currency", "description", "direction", "hizmetId", "id", "kasaAmount", "method", "purchaseId", "recordedAt", "recordedById", "studentId", "updatedAt") SELECT "amount", "createdAt", "currency", "description", "direction", "hizmetId", "id", "kasaAmount", "method", "purchaseId", "recordedAt", "recordedById", "studentId", "updatedAt" FROM "Payment";
DROP TABLE "Payment";
ALTER TABLE "new_Payment" RENAME TO "Payment";
CREATE INDEX "Payment_studentId_idx" ON "Payment"("studentId");
CREATE INDEX "Payment_recordedAt_idx" ON "Payment"("recordedAt");
CREATE INDEX "Payment_hizmetId_idx" ON "Payment"("hizmetId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
