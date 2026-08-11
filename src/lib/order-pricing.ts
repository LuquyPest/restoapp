import { prisma } from "@/lib/prisma"

interface OrderLineInput { menuItemId: string; quantity: number }

interface ResolveOrderPricingOptions {
  lines: OrderLineInput[]
  partnerId?: string | null
  loyaltyCardId?: string | null
  customAdjustmentType?: "PERCENT" | "FIXED" | null
  customAdjustmentValue?: number | null
}

// Calcul prix/remise partagé entre la création de commande classique et de ticket.
// Lève une Error si un article est introuvable/indisponible — à catcher côté route.
export async function resolveOrderPricing(companyId: string, opts: ResolveOrderPricingOptions) {
  const menuItemIds = opts.lines.map(l => l.menuItemId)
  const menuItems = await prisma.menuItem.findMany({
    where: { id: { in: menuItemIds }, companyId, isAvailable: true, deletedAt: null },
  })
  if (menuItems.length !== menuItemIds.length) {
    throw new Error("Article introuvable ou indisponible")
  }
  const priceMap = new Map(menuItems.map(m => [m.id, m]))

  const subtotal = opts.lines.reduce((s, l) => s + priceMap.get(l.menuItemId)!.price * l.quantity, 0)

  let partnerDiscount = 0
  let partner = null
  if (opts.partnerId) {
    partner = await prisma.partner.findFirst({ where: { id: opts.partnerId, companyId, isActive: true } })
    if (partner) partnerDiscount = partner.discountPercent
  }

  let loyaltyDiscount = 0
  let loyaltyCard = null
  if (opts.loyaltyCardId) {
    loyaltyCard = await prisma.loyaltyCard.findFirst({
      where: { id: opts.loyaltyCardId, companyId, isActive: true, expiresAt: { gte: new Date() } },
    })
    if (loyaltyCard) loyaltyDiscount = loyaltyCard.discountPercent
  }

  // La plus forte remise s'applique, elles ne se cumulent pas
  const discountPercent = Math.max(partnerDiscount, loyaltyDiscount)
  const discountAmount = subtotal * (discountPercent / 100)
  const afterDiscount = Math.max(0, subtotal - discountAmount)

  let customAdjustmentAmount = 0
  if (opts.customAdjustmentType && opts.customAdjustmentValue != null) {
    customAdjustmentAmount = opts.customAdjustmentType === "PERCENT"
      ? afterDiscount * (opts.customAdjustmentValue / 100)
      : opts.customAdjustmentValue
  }
  const total = Math.max(0, afterDiscount + customAdjustmentAmount)

  return { priceMap, subtotal, discountAmount, total, partner, loyaltyCard }
}
