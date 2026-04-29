import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 })

  const { role, restaurantId } = session.user
  if (role === "EMPLOYEE") return NextResponse.json({ error: "Interdit" }, { status: 403 })

  const item = await prisma.menuItem.findFirst({ where: { id: params.id, restaurantId } })
  if (!item) return NextResponse.json({ error: "Introuvable" }, { status: 404 })

  const body = await req.json()
  const updated = await prisma.menuItem.update({
    where: { id: params.id },
    data: {
      ...(body.name && { name: body.name }),
      ...(body.price !== undefined && { price: body.price }),
      ...(body.category && { category: body.category }),
      ...(body.description !== undefined && { description: body.description }),
      ...(body.isAvailable !== undefined && { isAvailable: body.isAvailable }),
    },
  })

  return NextResponse.json(updated)
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 })

  const { role, restaurantId } = session.user
  if (role === "EMPLOYEE") return NextResponse.json({ error: "Interdit" }, { status: 403 })

  const item = await prisma.menuItem.findFirst({ where: { id: params.id, restaurantId } })
  if (!item) return NextResponse.json({ error: "Introuvable" }, { status: 404 })

  await prisma.menuItem.delete({ where: { id: params.id } })
  return NextResponse.json({ ok: true })
}
