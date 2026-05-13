import { prisma } from "@/lib/prisma"

export type AuditAction =
  | "LOGIN_SUCCESS" | "LOGIN_FAILED"
  | "ADMIN_LOGIN_SUCCESS" | "ADMIN_LOGIN_FAILED"
  | "LOGOUT" | "ADMIN_LOGOUT"
  | "PASSWORD_CHANGED" | "PASSWORD_RESET"
  | "EMPLOYEE_CREATED" | "EMPLOYEE_DELETED"
  | "RESTAURANT_CREATED" | "RESTAURANT_DELETED"
  | "PAYROLL_GENERATED"
  | "ORDER_CANCELLED"

interface LogEntry {
  action: AuditAction
  userId?: string
  userEmail?: string
  restaurantId?: string
  ip?: string
  metadata?: Record<string, unknown>
}

export function log(entry: LogEntry): void {
  prisma.auditLog.create({
    data: {
      action: entry.action,
      userId: entry.userId ?? null,
      userEmail: entry.userEmail ?? null,
      restaurantId: entry.restaurantId ?? null,
      ip: entry.ip ?? null,
      metadata: entry.metadata ? JSON.stringify(entry.metadata) : null,
    },
  }).catch(() => {})
}

export function getIp(headers: Headers): string {
  return headers.get("x-forwarded-for")?.split(",")[0].trim()
    ?? headers.get("x-real-ip")
    ?? "unknown"
}
