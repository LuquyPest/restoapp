import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const patchSchema = z.object({
  addWeeks: z.number().int().min(-52).max(52).optional(),
  isActive: z.boolean().optional(),
  discountPercent: z.number().min(0).max(100).optional(),
  firstName: z.string().min(1).max(50).optional(),
  lastName: z.string().min(1).max(50).optional(),
})

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
  const { role, companyId } = session.user
  if (role === "EMPLOYEE") return NextResponse.json({ error: "Interdit" }, { status: 403 })
  const { id } = await params
  const body = await req.json()
  const parsed = patchSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: "Données invalides" }, { status: 400 })

  const card = await prisma.loyaltyCard.findFirst({ where: { id, companyId } })
  if (!card) return NextResponse.json({ error: "Introuvable" }, { status: 404 })

  const updateData: Record<string, unknown> = {}
  if (parsed.data.addWeeks !== undefined) {
    const current = new Date(card.expiresAt)
    current.setDate(current.getDate() + parsed.data.addWeeks * 7)
    updateData.expiresAt = current
  }
  if (parsed.data.isActive !== undefined) updateData.isActive = parsed.data.isActive
  if (parsed.data.discountPercent !== undefined) updateData.discountPercent = parsed.data.discountPercent
  if (parsed.data.firstName !== undefined) updateData.firstName = parsed.data.firstName
  if (parsed.data.lastName !== undefined) updateData.lastName = parsed.data.lastName

  const updated = await prisma.loyaltyCard.update({ where: { id }, data: updateData })
  return NextResponse.json(updated)
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
  const { role, companyId } = session.user
  if (role !== "OWNER") return NextResponse.json({ error: "Interdit" }, { status: 403 })
  const { id } = await params
  await prisma.loyaltyCard.deleteMany({ where: { id, companyId } })
  return NextResponse.json({ ok: true })
}
