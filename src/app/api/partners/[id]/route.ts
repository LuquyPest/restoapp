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
  const partner = await prisma.partner.findFirst({ where: { id, restaurantId } })
  if (!partner) return NextResponse.json({ error: "Introuvable" }, { status: 404 })
  const updated = await prisma.partner.update({
    where: { id },
    data: {
      ...(body.name !== undefined && { name: body.name }),
      ...(body.discountPercent !== undefined && { discountPercent: body.discountPercent }),
      ...(body.isActive !== undefined && { isActive: body.isActive }),
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
  await prisma.partner.updateMany({ where: { id, restaurantId }, data: { isActive: false } })
  return NextResponse.json({ ok: true })
}
