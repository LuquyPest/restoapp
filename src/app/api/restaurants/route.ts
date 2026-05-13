import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { log, getIp } from "@/lib/logger"
import { z } from "zod"

const schema = z.object({
  name: z.string().min(1).optional(),
  currency: z.string().min(1).max(5).optional(),
  taxRate: z.number().min(0).max(100).optional(),
  bonusRate: z.number().min(0).max(100).optional(),
  dividendRate: z.number().min(0).max(100).optional(),
  logo: z.string().url().max(500).nullable().optional(),
  webhookUrl: z.string().url().max(2000).nullable().optional(),
})

export async function PATCH(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
  if (session.user.role !== "OWNER") return NextResponse.json({ error: "Interdit" }, { status: 403 })

  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: "Données invalides" }, { status: 400 })

  const previous = await prisma.restaurant.findUnique({ where: { id: session.user.restaurantId } })

  const restaurant = await prisma.restaurant.update({
    where: { id: session.user.restaurantId },
    data: parsed.data,
  })

  const rateFields = ["taxRate", "bonusRate", "dividendRate"] as const
  const changed = rateFields.some(f => parsed.data[f] !== undefined && parsed.data[f] !== previous?.[f])
  if (changed) {
    await log({
      action: "RESTAURANT_RATES_MODIFIED",
      userId: session.user.id,
      userEmail: session.user.email ?? undefined,
      restaurantId: session.user.restaurantId,
      ip: getIp(req.headers),
      metadata: {
        before: { taxRate: previous?.taxRate, bonusRate: previous?.bonusRate, dividendRate: previous?.dividendRate },
        after: { taxRate: restaurant.taxRate, bonusRate: restaurant.bonusRate, dividendRate: restaurant.dividendRate },
      },
    })
  }

  return NextResponse.json(restaurant)
}
