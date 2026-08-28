-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_CashRegisterEntry" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "accountId" TEXT NOT NULL,
    "entryType" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'EUR',
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
INSERT INTO "new_CashRegisterEntry" ("accountId", "amount", "createdAt", "currency", "description", "entryType", "expenseId", "id", "paymentId", "recordedAt", "recordedById") SELECT "accountId", "amount", "createdAt", "currency", "description", "entryType", "expenseId", "id", "paymentId", "recordedAt", "recordedById" FROM "CashRegisterEntry";
DROP TABLE "CashRegisterEntry";
ALTER TABLE "new_CashRegisterEntry" RENAME TO "CashRegisterEntry";
CREATE UNIQUE INDEX "CashRegisterEntry_paymentId_key" ON "CashRegisterEntry"("paymentId");
CREATE UNIQUE INDEX "CashRegisterEntry_expenseId_key" ON "CashRegisterEntry"("expenseId");
CREATE UNIQUE INDEX "CashRegisterEntry_payoutId_key" ON "CashRegisterEntry"("payoutId");
CREATE INDEX "CashRegisterEntry_accountId_idx" ON "CashRegisterEntry"("accountId");
CREATE INDEX "CashRegisterEntry_recordedAt_idx" ON "CashRegisterEntry"("recordedAt");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
