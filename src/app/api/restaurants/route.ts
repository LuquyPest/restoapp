import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const schema = z.object({
  name: z.string().min(1).optional(),
  currency: z.string().min(1).max(5).optional(),
  taxRate: z.number().min(0).max(100).optional(),
  bonusRate: z.number().min(0).max(100).optional(),
  dividendRate: z.number().min(0).max(100).optional(),
})

export async function PATCH(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
  if (session.user.role !== "OWNER") return NextResponse.json({ error: "Interdit" }, { status: 403 })

  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: "Données invalides" }, { status: 400 })

  const restaurant = await prisma.restaurant.update({
    where: { id: session.user.restaurantId },
    data: parsed.data,
  })
  return NextResponse.json(restaurant)
}
