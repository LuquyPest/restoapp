import { prisma } from "@/lib/prisma"
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

interface OrderLineInput { menuItemId: string; quantity: number }

// Déduit le stock des ingrédients (via RecipeLine) pour les lignes d'une commande,
// puis alerte (notification + webhook) si un ingrédient passe sous son seuil.
export async function deductOrderStock(companyId: string, lines: OrderLineInput[]) {
  const menuItemIds = lines.map(l => l.menuItemId)
  const recipeLines = await prisma.recipeLine.findMany({
    where: { menuItemId: { in: menuItemIds } },
    include: { ingredient: true },
  })
  if (recipeLines.length === 0) return

  const deductions = new Map<string, number>()
  for (const line of lines) {
    for (const r of recipeLines.filter(r => r.menuItemId === line.menuItemId)) {
      deductions.set(r.ingredientId, (deductions.get(r.ingredientId) ?? 0) + r.quantity * line.quantity)
    }
  }

  await Promise.all(
    Array.from(deductions.entries()).map(([ingredientId, qty]) =>
      prisma.ingredient.update({ where: { id: ingredientId }, data: { quantity: { decrement: qty } } })
    )
  )

  const company = await prisma.company.findUnique({ where: { id: companyId }, select: { stockAlertWebhookUrl: true, name: true, currency: true } })
  if (!company?.stockAlertWebhookUrl) return

  const updatedIngredients = await prisma.ingredient.findMany({ where: { id: { in: Array.from(deductions.keys()) } } })
  const lowStock = updatedIngredients.filter(i => i.quantity <= i.minQuantity)
  if (lowStock.length === 0) return

  await Promise.all(lowStock.map(i =>
    upsertNotification({
      companyId, type: "LOW_STOCK", entityId: i.id,
      title: "Stock bas", body: `${i.name} — stock: ${i.quantity} (seuil: ${i.minQuantity})`,
    })
  ))

  const alertUrl = company.stockAlertWebhookUrl
  // Vérification DNS au moment du fetch pour contrer le DNS rebinding
  if (!(await isSafeToFetch(alertUrl))) return

  const isDiscord = /discord(?:app)?\.com\/api\/webhooks\//.test(alertUrl)
  const payload = isDiscord
    ? {
        embeds: [{
          title: `⚠️ Stock bas — ${company.name}`,
          color: 0xf59e0b,
          fields: lowStock.map(i => ({ name: i.name, value: `Stock: **${i.quantity}** (seuil: ${i.minQuantity})`, inline: true })),
          footer: { text: "RestoCompta · Alerte stock" },
          timestamp: new Date().toISOString(),
        }],
      }
    : { type: "LOW_STOCK", company: company.name, ingredients: lowStock.map(i => ({ name: i.name, quantity: i.quantity, minQuantity: i.minQuantity })) }

  fetch(alertUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(10_000),
  }).catch(() => {})
}

// Restaure le stock (inverse de deductOrderStock) — utilisé à la suppression
// et à l'annulation d'une commande.
export async function restoreOrderStock(lines: OrderLineInput[]) {
  if (lines.length === 0) return
  const menuItemIds = lines.map(l => l.menuItemId)
  const recipeLines = await prisma.recipeLine.findMany({ where: { menuItemId: { in: menuItemIds } } })
  if (recipeLines.length === 0) return

  const restorations = new Map<string, number>()
  for (const line of lines) {
    for (const r of recipeLines.filter(r => r.menuItemId === line.menuItemId)) {
      restorations.set(r.ingredientId, (restorations.get(r.ingredientId) ?? 0) + r.quantity * line.quantity)
    }
  }
  await Promise.all(
    Array.from(restorations.entries()).map(([ingredientId, qty]) =>
      prisma.ingredient.update({ where: { id: ingredientId }, data: { quantity: { increment: qty } } })
    )
  )
}
