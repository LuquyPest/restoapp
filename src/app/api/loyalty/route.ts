import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const schema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  discountPercent: z.number().min(0).max(100),
})

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
  const cards = await prisma.loyaltyCard.findMany({
    where: { restaurantId: session.user.restaurantId },
    orderBy: { createdAt: "desc" },
  })
  return NextResponse.json(cards)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
  const { role, restaurantId } = session.user
  if (role === "EMPLOYEE") return NextResponse.json({ error: "Interdit" }, { status: 403 })
  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: "Données invalides" }, { status: 400 })

  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + 7) // 1 week default

  const card = await prisma.loyaltyCard.create({
    data: { ...parsed.data, restaurantId, expiresAt },
  })
  return NextResponse.json(card, { status: 201 })
}
