import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { log, getIp } from "@/lib/logger"
import { z } from "zod"

const PRIVATE_IP = /^(localhost|127\.|10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.|169\.254\.|0\.0\.0\.0|::1|fc00:|fd)/i

function isSafeWebhookUrl(url: string): boolean {
  try {
    const { hostname, protocol } = new URL(url)
    if (protocol !== "https:") return false
    if (PRIVATE_IP.test(hostname)) return false
    return true
  } catch { return false }
}

const schema = z.object({
  name: z.string().min(1).optional(),
  currency: z.string().min(1).max(5).optional(),
  taxRate: z.number().min(0).max(100).optional(),
  bonusRate: z.number().min(0).max(100).optional(),
  dividendRate: z.number().min(0).max(100).optional(),
  logo: z.string().url().max(500).nullable().optional(),
  webhookUrl: z.string().url().max(2000).nullable().optional().refine(
    v => v == null || isSafeWebhookUrl(v),
    { message: "L'URL webhook doit être HTTPS et pointer vers un hôte public" }
  ),
  webhookDay: z.number().int().min(1).max(7).optional(),
  webhookHour: z.number().int().min(0).max(23).optional(),
  stockAlertWebhookUrl: z.string().url().max(2000).nullable().optional().refine(
    v => v == null || isSafeWebhookUrl(v),
    { message: "L'URL webhook doit être HTTPS et pointer vers un hôte public" }
  ),
})

export async function PATCH(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
  if (session.user.role !== "OWNER") return NextResponse.json({ error: "Interdit" }, { status: 403 })

  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: "Données invalides" }, { status: 400 })

  const previous = await prisma.company.findUnique({ where: { id: session.user.companyId } })

  const company = await prisma.company.update({
    where: { id: session.user.companyId },
    data: parsed.data,
  })

  const rateFields = ["taxRate", "bonusRate", "dividendRate"] as const
  const changed = rateFields.some(f => parsed.data[f] !== undefined && parsed.data[f] !== previous?.[f])
  if (changed) {
    await log({
      action: "RESTAURANT_RATES_MODIFIED",
      userId: session.user.id,
      userEmail: session.user.email ?? undefined,
      companyId: session.user.companyId,
      ip: getIp(req.headers),
      metadata: {
        before: { taxRate: previous?.taxRate, bonusRate: previous?.bonusRate, dividendRate: previous?.dividendRate },
        after: { taxRate: company.taxRate, bonusRate: company.bonusRate, dividendRate: company.dividendRate },
      },
    })
  }

  return NextResponse.json(company)
}
