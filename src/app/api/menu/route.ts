import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const schema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  price: z.number().positive(),
  costPrice: z.number().min(0).optional(),
  category: z.string().min(1),
  imageUrl: z.string().url().optional().or(z.literal("")),
  isAvailable: z.boolean().optional(),
})

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
  const items = await prisma.menuItem.findMany({
    where: { restaurantId: session.user.restaurantId, deletedAt: null },
    orderBy: [{ category: "asc" }, { name: "asc" }],
  })
  return NextResponse.json(items)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
  const { role, restaurantId } = session.user
  if (role === "EMPLOYEE") return NextResponse.json({ error: "Interdit" }, { status: 403 })
  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: "Données invalides" }, { status: 400 })
  const item = await prisma.menuItem.create({
    data: { ...parsed.data, imageUrl: parsed.data.imageUrl || null, restaurantId },
  })
  return NextResponse.json(item, { status: 201 })
}
