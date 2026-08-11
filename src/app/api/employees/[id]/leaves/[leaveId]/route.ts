import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { getEmployeeForAccess } from "@/lib/employee-access"
import { logEmployeeEvent } from "@/lib/employee-events"
import { upsertUserNotification } from "@/lib/notifications"
import { z } from "zod"

const decideSchema = z.object({
  status: z.enum(["APPROVED", "REJECTED"]),
  decisionNote: z.string().max(2000).optional(),
})

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string; leaveId: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
  const { id, leaveId } = await params
  const { employee, canManage } = await getEmployeeForAccess(session, id, { allowSelf: false })
  if (!employee) return NextResponse.json({ error: "Introuvable" }, { status: 404 })
  if (!canManage) return NextResponse.json({ error: "Interdit" }, { status: 403 })

  const body = await req.json()
  const parsed = decideSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: "Données invalides" }, { status: 400 })

  const leave = await prisma.employeeLeave.findFirst({ where: { id: leaveId, employeeId: id } })
  if (!leave) return NextResponse.json({ error: "Introuvable" }, { status: 404 })
  if (leave.status !== "PENDING") return NextResponse.json({ error: "Cette demande a déjà été traitée" }, { status: 409 })

  const updated = await prisma.employeeLeave.update({
    where: { id: leaveId },
    data: {
      status: parsed.data.status,
      decisionNote: parsed.data.decisionNote ?? null,
      decidedByUserId: session.user.id,
      decidedAt: new Date(),
    },
  })

  if (parsed.data.status === "APPROVED" && leave.type === "PAID" && employee.paidLeaveBalance !== null) {
    await prisma.employee.update({ where: { id }, data: { paidLeaveBalance: { decrement: leave.daysCount } } })
  }

  await logEmployeeEvent({
    companyId: session.user.companyId!, employeeId: id,
    type: parsed.data.status === "APPROVED" ? "LEAVE_APPROVED" : "LEAVE_REJECTED",
    title: `${parsed.data.status === "APPROVED" ? "Congé approuvé" : "Congé refusé"} — ${leave.daysCount} j`,
    actorUserId: session.user.id,
  })

  const companyId = session.user.companyId!
  await prisma.notification.updateMany({
    where: { companyId, type: "LEAVE_REQUESTED", entityId: { startsWith: `leave:${leaveId}:` } },
    data: { isRead: true },
  })
  await upsertUserNotification({
    companyId, type: "LEAVE_DECIDED", entitySlug: `leave:${leaveId}`, recipientUserId: employee.userId,
    title: parsed.data.status === "APPROVED" ? "Congé approuvé" : "Congé refusé",
    body: `${leave.daysCount} j à partir du ${leave.startDate.toLocaleDateString("fr-FR")}`,
  })

  return NextResponse.json(updated)
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string; leaveId: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
  const { id, leaveId } = await params
  const { employee, canManage, isSelf } = await getEmployeeForAccess(session, id)
  if (!employee) return NextResponse.json({ error: "Introuvable" }, { status: 404 })
  if (!canManage && !isSelf) return NextResponse.json({ error: "Interdit" }, { status: 403 })

  const leave = await prisma.employeeLeave.findFirst({ where: { id: leaveId, employeeId: id } })
  if (!leave) return NextResponse.json({ error: "Introuvable" }, { status: 404 })
  if (!canManage && leave.status !== "PENDING") {
    return NextResponse.json({ error: "Seule une demande en attente peut être annulée" }, { status: 409 })
  }

  await prisma.employeeLeave.delete({ where: { id: leaveId } })
  await prisma.notification.updateMany({
    where: { companyId: session.user.companyId!, type: "LEAVE_REQUESTED", entityId: { startsWith: `leave:${leaveId}:` } },
    data: { isRead: true },
  })
  return NextResponse.json({ ok: true })
}
