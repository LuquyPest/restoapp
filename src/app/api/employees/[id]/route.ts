import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
  const { role, restaurantId } = session.user
  if (role === "EMPLOYEE") return NextResponse.json({ error: "Interdit" }, { status: 403 })
  const { id } = await params
  const body = await req.json()
  const employee = await prisma.employee.findFirst({ where: { id, restaurantId } })
  if (!employee) return NextResponse.json({ error: "Introuvable" }, { status: 404 })
  const updated = await prisma.employee.update({
    where: { id },
    data: {
      ...(body.isActive !== undefined && { isActive: body.isActive }),
      ...(body.gradeId && { gradeId: body.gradeId }),
      ...(body.phone !== undefined && { phone: body.phone }),
      ...(body.accountNumber !== undefined && { accountNumber: body.accountNumber }),
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
  return NextResponse.json({ ok: true })
}
