import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import { getISOWeek } from "@/lib/utils"
import { upsertNotification } from "@/lib/notifications"
import { promises as dns } from "dns"

const PRIVATE_IP = /^(localhost|127\.|10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.|169\.254\.|0\.0\.0\.0|::1|fc00:|fd)/i

async function isSafeToFetch(url: string): Promise<boolean> {
  try {
    const { hostname } = new URL(url)
    const addrs = await dns.resolve4(hostname).catch(async () => dns.resolve6(hostname))
    return addrs.every((a: string) => !PRIVATE_IP.test(a))
  } catch { return false }
}

const createSchema = z.object({
  lines: z.array(z.object({
    menuItemId: z.string(),
    quantity: z.number().int().positive(),
  })).min(1),
  note: z.string().max(500).optional(),
  partnerId: z.string().optional().nullable(),
  loyaltyCardId: z.string().optional().nullable(),
  customAdjustmentType: z.enum(["PERCENT", "FIXED"]).optional().nullable(),
  customAdjustmentValue: z.number().min(-100000).max(100000).optional().nullable(),
  weekNumber: z.number().int().min(1).max(53).optional(),
  year: z.number().int().min(2020).max(2099).optional(),
})

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 })

  const body = await req.json()
  const parsed = createSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: "Données invalides" }, { status: 400 })

  const { restaurantId } = session.user
  const now = new Date()
  const weekNumber = parsed.data.weekNumber ?? getISOWeek(now)
  const year = parsed.data.year ?? now.getFullYear()

  // Fetch prices from DB — never trust client-supplied prices
  const menuItemIds = parsed.data.lines.map(l => l.menuItemId)
  const menuItems = await prisma.menuItem.findMany({
    where: { id: { in: menuItemIds }, restaurantId, isAvailable: true, deletedAt: null },
  })
  if (menuItems.length !== menuItemIds.length) {
    return NextResponse.json({ error: "Article introuvable ou indisponible" }, { status: 404 })
  }
  const priceMap = new Map(menuItems.map(m => [m.id, m]))

  let employee = await prisma.employee.findFirst({ where: { userId: session.user.id } })
  if (!employee) {
    const grade = await prisma.grade.findFirst({ where: { restaurantId } })
    if (!grade) return NextResponse.json({ error: "Aucun grade configuré" }, { status: 400 })
    employee = await prisma.employee.create({
      data: {
        userId: session.user.id, restaurantId, gradeId: grade.id,
        firstName: session.user.name?.split(" ")[0] ?? "Patron",
        lastName: session.user.name?.split(" ").slice(1).join(" ") ?? "",
      },
    })
  }

  const subtotal = parsed.data.lines.reduce((s, l) => s + priceMap.get(l.menuItemId)!.price * l.quantity, 0)

  // Get partner discount
  let partnerDiscount = 0
  let partner = null
  if (parsed.data.partnerId) {
    partner = await prisma.partner.findFirst({ where: { id: parsed.data.partnerId, restaurantId, isActive: true } })
    if (partner) partnerDiscount = partner.discountPercent
  }

  // Get loyalty card discount
  let loyaltyDiscount = 0
  let loyaltyCard = null
  if (parsed.data.loyaltyCardId) {
    loyaltyCard = await prisma.loyaltyCard.findFirst({
      where: { id: parsed.data.loyaltyCardId, restaurantId, isActive: true, expiresAt: { gte: now } },
    })
    if (loyaltyCard) loyaltyDiscount = loyaltyCard.discountPercent
  }

  // Apply best discount (not cumulative)
  const discountPercent = Math.max(partnerDiscount, loyaltyDiscount)
  const discountAmount = subtotal * (discountPercent / 100)
  const afterDiscount = Math.max(0, subtotal - discountAmount)

  // Apply custom adjustment (majoration or réduction)
  let customAdjustmentAmount = 0
  const { customAdjustmentType, customAdjustmentValue } = parsed.data
  if (customAdjustmentType && customAdjustmentValue != null) {
    if (customAdjustmentType === "PERCENT") {
      customAdjustmentAmount = afterDiscount * (customAdjustmentValue / 100)
    } else {
      customAdjustmentAmount = customAdjustmentValue
    }
  }
  const total = Math.max(0, afterDiscount + customAdjustmentAmount)

  const order = await prisma.order.create({
    data: {
      restaurantId, employeeId: employee.id,
      partnerId: partner?.id ?? null,
      loyaltyCardId: loyaltyCard?.id ?? null,
      total, discountAmount,
      customAdjustmentType: customAdjustmentType ?? null,
      customAdjustmentValue: customAdjustmentValue ?? null,
      status: "CONFIRMED",
      note: parsed.data.note,
      weekNumber, year,
      lines: {
        create: parsed.data.lines.map(l => ({
          menuItemId: l.menuItemId,
          quantity: l.quantity,
          unitPrice: priceMap.get(l.menuItemId)!.price,
          costPrice: priceMap.get(l.menuItemId)!.costPrice,
        })),
      },
    },
  })

  // Deduct stock for each order line based on recipe
  const recipeLines = await prisma.recipeLine.findMany({
    where: { menuItemId: { in: menuItemIds } },
    include: { ingredient: true },
  })

  if (recipeLines.length > 0) {
    const deductions = new Map<string, number>()
    for (const orderLine of parsed.data.lines) {
      const lines = recipeLines.filter(r => r.menuItemId === orderLine.menuItemId)
      for (const r of lines) {
        deductions.set(r.ingredientId, (deductions.get(r.ingredientId) ?? 0) + r.quantity * orderLine.quantity)
      }
    }

    await Promise.all(
      Array.from(deductions.entries()).map(([ingredientId, qty]) =>
        prisma.ingredient.update({
          where: { id: ingredientId },
          data: { quantity: { decrement: qty } },
        })
      )
    )

    // Check low stock and send alert
    const restaurant = await prisma.restaurant.findUnique({ where: { id: restaurantId }, select: { stockAlertWebhookUrl: true, name: true, currency: true } })
    if (restaurant?.stockAlertWebhookUrl) {
      const updatedIngredients = await prisma.ingredient.findMany({
        where: { id: { in: Array.from(deductions.keys()) } },
      })
      const lowStock = updatedIngredients.filter(i => i.quantity <= i.minQuantity)
      if (lowStock.length > 0) {
        // DB notifications (persistent, dismissable)
        await Promise.all(lowStock.map(i =>
          upsertNotification({
            restaurantId,
            type: "LOW_STOCK",
            entityId: i.id,
            title: "Stock bas",
            body: `${i.name} — stock: ${i.quantity} (seuil: ${i.minQuantity})`,
          })
        ))

        const alertUrl = restaurant.stockAlertWebhookUrl
        // Vérification DNS au moment du fetch pour contrer le DNS rebinding
        if (await isSafeToFetch(alertUrl)) {
          const isDiscord = /discord(?:app)?\.com\/api\/webhooks\//.test(alertUrl)
          const payload = isDiscord
            ? {
                embeds: [{
                  title: `⚠️ Stock bas — ${restaurant.name}`,
                  color: 0xf59e0b,
                  fields: lowStock.map(i => ({ name: i.name, value: `Stock: **${i.quantity}** (seuil: ${i.minQuantity})`, inline: true })),
                  footer: { text: "RestoCompta · Alerte stock" },
                  timestamp: new Date().toISOString(),
                }],
              }
            : { type: "LOW_STOCK", restaurant: restaurant.name, ingredients: lowStock.map(i => ({ name: i.name, quantity: i.quantity, minQuantity: i.minQuantity })) }

          fetch(alertUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
            signal: AbortSignal.timeout(10_000),
          }).catch(() => {})
        }
      }
    }
  }

  return NextResponse.json(order, { status: 201 })
}

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
  const { restaurantId, role } = session.user

  const where = role === "EMPLOYEE"
    ? { restaurantId, employee: { userId: session.user.id } }
    : { restaurantId }

  const orders = await prisma.order.findMany({
    where,
    include: {
      employee: { select: { id: true, firstName: true, lastName: true } },
      lines: { include: { menuItem: true } },
      partner: true,
      loyaltyCard: true,
    },
    orderBy: { createdAt: "desc" },
    take: 200,
  })
  return NextResponse.json(orders)
}
