import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { checkRateLimit } from "@/lib/rate-limit"
import { buildReportData, sendWebhook } from "@/lib/webhook-payload"
import { generateReportHtml } from "@/lib/report-html"
import { getISOWeek } from "@/lib/utils"

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
  if (session.user.role !== "OWNER") return NextResponse.json({ error: "Interdit" }, { status: 403 })

  if (!await checkRateLimit(`webhook-test:${session.user.id}`, 5, 60_000)) {
    return NextResponse.json({ error: "Trop de requêtes" }, { status: 429 })
  }

  const restaurant = await prisma.restaurant.findUnique({ where: { id: session.user.restaurantId } })
  if (!restaurant) return NextResponse.json({ error: "Introuvable" }, { status: 404 })
  if (!restaurant.webhookUrl) return NextResponse.json({ error: "Aucune URL webhook configurée" }, { status: 400 })

  const now = new Date()
  let week = getISOWeek(now) - 1
  let year = now.getFullYear()
  if (week < 1) { week = 52; year-- }

  try {
    const data = await buildReportData(restaurant.id, restaurant.name, restaurant.currency, week, year)
    const testData = { ...data, test: true }
    const html = generateReportHtml(testData, week, year)
    const htmlBuffer = Buffer.from(html, "utf-8")
    const status = await sendWebhook(restaurant.webhookUrl, testData, htmlBuffer, week, year)
    if (status.startsWith("error")) {
      return NextResponse.json({ error: `Le webhook a répondu avec le statut ${status}` }, { status: 502 })
    }
    return NextResponse.json({ success: true, status })
  } catch (e: any) {
    return NextResponse.json({ error: `Erreur de connexion : ${e.message}` }, { status: 502 })
  }
}
