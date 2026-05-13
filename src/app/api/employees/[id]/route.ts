import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { log, getIp } from "@/lib/logger"
import { z } from "zod"

const patchSchema = z.object({
  isActive: z.boolean().optional(),
  gradeId: z.string().cuid().optional(),
  phone: z.string().max(30).optional().nullable(),
  accountNumber: z.string().max(50).optional().nullable(),
})

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
  const { role, restaurantId } = session.user
  if (role === "EMPLOYEE") return NextResponse.json({ error: "Interdit" }, { status: 403 })
  const { id } = await params
  const body = await req.json()
  const parsed = patchSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: "Données invalides" }, { status: 400 })
  const employee = await prisma.employee.findFirst({ where: { id, restaurantId } })
  if (!employee) return NextResponse.json({ error: "Introuvable" }, { status: 404 })
  const updated = await prisma.employee.update({
    where: { id },
    data: {
      ...(parsed.data.isActive !== undefined && { isActive: parsed.data.isActive }),
      ...(parsed.data.gradeId && { gradeId: parsed.data.gradeId }),
      ...(parsed.data.phone !== undefined && { phone: parsed.data.phone }),
      ...(parsed.data.accountNumber !== undefined && { accountNumber: parsed.data.accountNumber }),
    },
  })
  return NextResponse.json(updated)
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
  const { role, restaurantId } = session.user
  if (role !== "OWNER") return NextResponse.json({ error: "Interdit" }, { status: 403 })
  const { id } = await params
  const employee = await prisma.employee.findFirst({ where: { id, restaurantId } })
  if (!employee) return NextResponse.json({ error: "Introuvable" }, { status: 404 })
  await prisma.user.delete({ where: { id: employee.userId } })
  log({
    action: "EMPLOYEE_DELETED",
    userId: session.user.id,
    userEmail: session.user.email ?? undefined,
    restaurantId: restaurantId ?? undefined,
    ip: getIp(req.headers),
    metadata: { employeeId: id },
  })
  return NextResponse.json({ ok: true })
}
