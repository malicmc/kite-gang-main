import "server-only";
import { prisma } from "./prisma";

export async function logAudit({
  userId,
  action,
  entity,
  entityId,
  oldValues,
  newValues,
}: {
  userId?: string;
  action: string;
  entity: string;
  entityId?: string;
  oldValues?: Record<string, unknown>;
  newValues?: Record<string, unknown>;
}) {
  try {
    await prisma.auditLog.create({
      data: {
        userId,
        action,
        entity,
        entityId,
        oldValues: oldValues ? JSON.stringify(oldValues) : null,
        newValues: newValues ? JSON.stringify(newValues) : null,
      },
    });
  } catch (err) {
    // Audit logging is best-effort — a stale session referencing a deleted
    // user (e.g. after a dev database reset) must not crash the action that
    // already succeeded.
    console.error("logAudit failed:", err);
  }
}
