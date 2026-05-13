import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { log, getIp } from "@/lib/logger"
import { z } from "zod"

const patchSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  price: z.number().positive().optional(),
  costPrice: z.number().min(0).optional(),
  category: z.string().min(1).max(50).optional(),
  description: z.string().max(500).optional().nullable(),
  imageUrl: z.string().url().max(500).optional().nullable().or(z.literal("")),
  isAvailable: z.boolean().optional(),
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
  const item = await prisma.menuItem.findFirst({ where: { id, restaurantId, deletedAt: null } })
  if (!item) return NextResponse.json({ error: "Introuvable" }, { status: 404 })
  const updated = await prisma.menuItem.update({
    where: { id },
    data: {
      ...(parsed.data.name !== undefined && { name: parsed.data.name }),
      ...(parsed.data.price !== undefined && { price: parsed.data.price }),
      ...(parsed.data.costPrice !== undefined && { costPrice: parsed.data.costPrice }),
      ...(parsed.data.category !== undefined && { category: parsed.data.category }),
      ...(parsed.data.description !== undefined && { description: parsed.data.description }),
      ...(parsed.data.imageUrl !== undefined && { imageUrl: parsed.data.imageUrl || null }),
      ...(parsed.data.isAvailable !== undefined && { isAvailable: parsed.data.isAvailable }),
    },
  })
  return NextResponse.json(updated)
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
  const { role, restaurantId } = session.user
  if (role === "EMPLOYEE") return NextResponse.json({ error: "Interdit" }, { status: 403 })
  const { id } = await params
  const item = await prisma.menuItem.findFirst({ where: { id, restaurantId, deletedAt: null } })
  if (!item) return NextResponse.json({ error: "Introuvable" }, { status: 404 })
  await prisma.menuItem.update({ where: { id }, data: { deletedAt: new Date() } })
  await log({
    action: "MENU_ITEM_DELETED",
    userId: session.user.id,
    userEmail: session.user.email ?? undefined,
    restaurantId,
    ip: getIp(req.headers),
    metadata: { itemId: id, name: item.name, price: item.price },
  })
  return NextResponse.json({ ok: true })
}
