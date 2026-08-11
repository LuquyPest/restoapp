import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { getEmployeeForAccess } from "@/lib/employee-access"
import { z } from "zod"

const createSchema = z.object({
  type: z.enum(["PAID", "UNPAID", "SICK", "OTHER"]),
  startDate: z.string(),
  endDate: z.string(),
  reason: z.string().max(2000).optional(),
  status: z.enum(["PENDING", "APPROVED", "REJECTED"]).optional(),
})

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
  const { id } = await params
  const { employee, allowed } = await getEmployeeForAccess(session, id)
  if (!employee) return NextResponse.json({ error: "Introuvable" }, { status: 404 })
  if (!allowed) return NextResponse.json({ error: "Interdit" }, { status: 403 })

  const leaves = await prisma.employeeLeave.findMany({
    where: { employeeId: id },
    orderBy: { startDate: "desc" },
  })
  return NextResponse.json(leaves)
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
  const { id } = await params
  const { employee, canManage, allowed } = await getEmployeeForAccess(session, id)
  if (!employee) return NextResponse.json({ error: "Introuvable" }, { status: 404 })
  if (!allowed) return NextResponse.json({ error: "Interdit" }, { status: 403 })

  const body = await req.json()
  const parsed = createSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: "Données invalides" }, { status: 400 })

  const startDate = new Date(parsed.data.startDate)
  const endDate = new Date(parsed.data.endDate)
  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime()) || endDate < startDate) {
    return NextResponse.json({ error: "Dates invalides" }, { status: 400 })
  }
  const daysCount = Math.floor((endDate.getTime() - startDate.getTime()) / 86400000) + 1

  // Seul un manager peut fixer directement un statut décidé ; l'employé crée toujours une demande PENDING
  const status = canManage && parsed.data.status ? parsed.data.status : "PENDING"
  const isDecided = status !== "PENDING"

  const leave = await prisma.employeeLeave.create({
    data: {
      companyId: session.user.companyId!,
      employeeId: id,
      type: parsed.data.type,
      startDate, endDate, daysCount,
      reason: parsed.data.reason ?? null,
      status,
      requestedByUserId: session.user.id,
      ...(isDecided && { decidedByUserId: session.user.id, decidedAt: new Date() }),
    },
  })

  if (status === "APPROVED" && leave.type === "PAID" && employee.paidLeaveBalance !== null) {
    await prisma.employee.update({ where: { id }, data: { paidLeaveBalance: { decrement: daysCount } } })
  }

  return NextResponse.json(leave, { status: 201 })
}
