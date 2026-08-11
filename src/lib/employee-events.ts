import { prisma } from "@/lib/prisma"
import type { EmployeeEventType } from "@prisma/client"

interface LogEmployeeEventParams {
  companyId: string
  employeeId: string
  type: EmployeeEventType
  title: string
  description?: string
  actorUserId?: string
  metadata?: Record<string, unknown>
}

export async function logEmployeeEvent(params: LogEmployeeEventParams): Promise<void> {
  let metadata: string | null = null
  if (params.metadata) {
    try { metadata = JSON.stringify(params.metadata) } catch { /* non-sérialisable */ }
  }
  try {
    await prisma.employeeEvent.create({
      data: {
        companyId: params.companyId,
        employeeId: params.employeeId,
        type: params.type,
        title: params.title,
        description: params.description ?? null,
        actorUserId: params.actorUserId ?? null,
        metadata,
      },
    })
  } catch (err) {
    console.error("[employee-event] échec de l'enregistrement:", err)
  }
}
