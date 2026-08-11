import { prisma } from "@/lib/prisma"

export type AuditAction =
  | "LOGIN_SUCCESS" | "LOGIN_FAILED"
  | "ADMIN_LOGIN_SUCCESS" | "ADMIN_LOGIN_FAILED"
  | "LOGOUT" | "ADMIN_LOGOUT"
  | "PASSWORD_CHANGED" | "PASSWORD_RESET"
  | "EMPLOYEE_CREATED" | "EMPLOYEE_DELETED"
  | "RESTAURANT_CREATED" | "RESTAURANT_DELETED"
  | "RESTAURANT_RATES_MODIFIED"
  | "PAYROLL_GENERATED"
  | "ORDER_CANCELLED" | "ORDER_DELETED"
  | "MENU_ITEM_DELETED"
  | "INVOICE_DELETED"
  | "CHARGE_DELETED"

interface LogEntry {
  action: AuditAction
  userId?: string
  userEmail?: string
  companyId?: string
  ip?: string
  metadata?: Record<string, unknown>
}

export async function log(entry: LogEntry): Promise<void> {
  let metadata: string | null = null
  if (entry.metadata) {
    try { metadata = JSON.stringify(entry.metadata) } catch { /* non-serialisable */ }
  }
  try {
    await prisma.auditLog.create({
      data: {
        action: entry.action,
        userId: entry.userId ?? null,
        userEmail: entry.userEmail ?? null,
        companyId: entry.companyId ?? null,
        ip: entry.ip ?? null,
        metadata,
      },
    })
  } catch (err) {
    console.error("[audit] échec de l'enregistrement du log:", err)
  }
}

export function getIp(headers: Headers): string {
  return headers.get("x-forwarded-for")?.split(",")[0].trim()
    ?? headers.get("x-real-ip")
    ?? "unknown"
}
