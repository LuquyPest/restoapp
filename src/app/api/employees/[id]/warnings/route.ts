import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { getEmployeeForAccess } from "@/lib/employee-access"
import { logEmployeeEvent } from "@/lib/employee-events"
import { z } from "zod"

const createSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().min(1).max(4000),
  occurredAt: z.string().optional(),
})

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
  const { id } = await params
  const { employee, allowed } = await getEmployeeForAccess(session, id)
  if (!employee) return NextResponse.json({ error: "Introuvable" }, { status: 404 })
  if (!allowed) return NextResponse.json({ error: "Interdit" }, { status: 403 })

  const warnings = await prisma.employeeWarning.findMany({
    where: { employeeId: id },
    orderBy: { occurredAt: "desc" },
  })
  return NextResponse.json(warnings)
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
  const { id } = await params
  const { employee, canManage } = await getEmployeeForAccess(session, id, { allowSelf: false })
  if (!employee) return NextResponse.json({ error: "Introuvable" }, { status: 404 })
  if (!canManage) return NextResponse.json({ error: "Interdit" }, { status: 403 })

  const body = await req.json()
  const parsed = createSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: "Données invalides" }, { status: 400 })

  const occurredAt = parsed.data.occurredAt ? new Date(parsed.data.occurredAt) : new Date()
  if (isNaN(occurredAt.getTime())) return NextResponse.json({ error: "Date invalide" }, { status: 400 })

  const warning = await prisma.employeeWarning.create({
    data: {
      companyId: session.user.companyId!,
      employeeId: id,
      authorUserId: session.user.id,
      title: parsed.data.title,
      description: parsed.data.description,
      occurredAt,
    },
  })
  await logEmployeeEvent({
    companyId: session.user.companyId!, employeeId: id, type: "WARNING_ADDED",
    title: `Avertissement : ${warning.title}`, actorUserId: session.user.id,
  })
  return NextResponse.json(warning, { status: 201 })
}
