import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { getEmployeeForAccess } from "@/lib/employee-access"
import { upsertUserNotification, getCompanyManagerIds } from "@/lib/notifications"
import type { UserRole } from "@prisma/client"
import { z } from "zod"

const createSchema = z.object({ body: z.string().min(1).max(4000) })

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
  const { id } = await params
  const { employee, allowed } = await getEmployeeForAccess(session, id)
  if (!employee) return NextResponse.json({ error: "Introuvable" }, { status: 404 })
  if (!allowed) return NextResponse.json({ error: "Interdit" }, { status: 403 })

  const messages = await prisma.employeeMessage.findMany({
    where: { employeeId: id },
    orderBy: { createdAt: "asc" },
    take: 200,
  })
  return NextResponse.json(messages)
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
  const { id } = await params
  const { employee, allowed } = await getEmployeeForAccess(session, id)
  if (!employee) return NextResponse.json({ error: "Introuvable" }, { status: 404 })
  if (!allowed) return NextResponse.json({ error: "Interdit" }, { status: 403 })

  const body = await req.json()
  const parsed = createSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: "Message invalide" }, { status: 400 })

  const isSelf = employee.userId === session.user.id
  const message = await prisma.employeeMessage.create({
    data: {
      companyId: session.user.companyId!,
      employeeId: id,
      authorUserId: session.user.id,
      authorRole: session.user.role as UserRole,
      body: parsed.data.body,
      readByEmployeeAt: isSelf ? new Date() : null,
      readByManagerAt: !isSelf ? new Date() : null,
    },
  })

  const companyId = session.user.companyId!
  if (isSelf) {
    const managerIds = await getCompanyManagerIds(companyId)
    await Promise.all(managerIds.map(managerId =>
      upsertUserNotification({
        companyId, type: "NEW_MESSAGE", entitySlug: `msg:${id}`, recipientUserId: managerId,
        title: "Nouveau message", body: `${employee.firstName} ${employee.lastName} vous a écrit`,
      })
    ))
  } else {
    await upsertUserNotification({
      companyId, type: "NEW_MESSAGE", entitySlug: `msg:${id}`, recipientUserId: employee.userId,
      title: "Nouveau message", body: `${session.user.name ?? "Votre manager"} vous a écrit`,
    })
  }

  return NextResponse.json(message, { status: 201 })
}
