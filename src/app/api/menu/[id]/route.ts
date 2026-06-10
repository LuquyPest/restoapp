import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { log, getIp } from "@/lib/logger"
import { z } from "zod"

const recipeLineSchema = z.object({
  ingredientId: z.string(),
  quantity: z.number().positive(),
})

const patchSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  price: z.number().positive().optional(),
  costPrice: z.number().min(0).optional(),
  category: z.string().min(1).max(50).optional(),
  description: z.string().max(500).optional().nullable(),
  imageUrl: z.string().url().max(500).optional().nullable().or(z.literal("")),
  isAvailable: z.boolean().optional(),
  recipeLines: z.array(recipeLineSchema).optional(),
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

  const { recipeLines, ...fields } = parsed.data

  if (recipeLines !== undefined) {
    if (recipeLines.length > 0) {
      const ingredientIds = recipeLines.map(l => l.ingredientId)
      const validIngredients = await prisma.ingredient.findMany({
        where: { id: { in: ingredientIds }, restaurantId },
        select: { id: true },
      })
      if (validIngredients.length !== ingredientIds.length) {
        return NextResponse.json({ error: "Ingrédient invalide" }, { status: 400 })
      }
    }
    await prisma.recipeLine.deleteMany({ where: { menuItemId: id } })
    if (recipeLines.length > 0) {
      await prisma.recipeLine.createMany({
        data: recipeLines.map(l => ({ menuItemId: id, ingredientId: l.ingredientId, quantity: l.quantity })),
      })
    }
  }

  const updated = await prisma.menuItem.update({
    where: { id },
    data: {
      ...(fields.name !== undefined && { name: fields.name }),
      ...(fields.price !== undefined && { price: fields.price }),
      ...(fields.costPrice !== undefined && { costPrice: fields.costPrice }),
      ...(fields.category !== undefined && { category: fields.category }),
      ...(fields.description !== undefined && { description: fields.description }),
      ...(fields.imageUrl !== undefined && { imageUrl: fields.imageUrl || null }),
      ...(fields.isAvailable !== undefined && { isAvailable: fields.isAvailable }),
    },
    include: { recipeLines: { include: { ingredient: true } } },
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
