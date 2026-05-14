import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { checkApiPageAccess } from "@/lib/page-access"
import { z } from "zod"

const patchSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  quantity: z.number().min(0).optional(),
  minQuantity: z.number().min(0).optional(),
  imageUrl: z.string().url().max(2000).nullable().optional(),
})

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
  if (!await checkApiPageAccess(session, "stock", ["OWNER"])) return NextResponse.json({ error: "Interdit" }, { status: 403 })

  const { id } = await params
  const body = await req.json()
  const parsed = patchSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: "Données invalides" }, { status: 400 })

  const existing = await prisma.ingredient.findFirst({ where: { id, restaurantId: session.user.restaurantId } })
  if (!existing) return NextResponse.json({ error: "Ingrédient introuvable" }, { status: 404 })

  const ingredient = await prisma.ingredient.update({ where: { id }, data: parsed.data })
  return NextResponse.json(ingredient)
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
  if (!await checkApiPageAccess(session, "stock", ["OWNER"])) return NextResponse.json({ error: "Interdit" }, { status: 403 })

  const { id } = await params
  const existing = await prisma.ingredient.findFirst({ where: { id, restaurantId: session.user.restaurantId } })
  if (!existing) return NextResponse.json({ error: "Ingrédient introuvable" }, { status: 404 })

  await prisma.ingredient.delete({ where: { id } })
  return new NextResponse(null, { status: 204 })
}
