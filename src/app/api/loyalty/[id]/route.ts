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

  const card = await prisma.loyaltyCard.findFirst({ where: { id, restaurantId } })
  if (!card) return NextResponse.json({ error: "Introuvable" }, { status: 404 })

  // Add or remove weeks
  let updateData: any = {}
  if (body.addWeeks !== undefined) {
    const current = new Date(card.expiresAt)
    current.setDate(current.getDate() + body.addWeeks * 7)
    updateData.expiresAt = current
  }
  if (body.isActive !== undefined) updateData.isActive = body.isActive
  if (body.discountPercent !== undefined) updateData.discountPercent = body.discountPercent
  if (body.firstName !== undefined) updateData.firstName = body.firstName
  if (body.lastName !== undefined) updateData.lastName = body.lastName

  const updated = await prisma.loyaltyCard.update({ where: { id }, data: updateData })
  return NextResponse.json(updated)
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
  const { role, restaurantId } = session.user
  if (role !== "OWNER") return NextResponse.json({ error: "Interdit" }, { status: 403 })
  const { id } = await params
  await prisma.loyaltyCard.deleteMany({ where: { id, restaurantId } })
  return NextResponse.json({ ok: true })
}
