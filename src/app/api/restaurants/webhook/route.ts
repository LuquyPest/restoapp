import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { checkRateLimit } from "@/lib/rate-limit"
import { buildWebhookPayload, buildBody } from "@/lib/webhook-payload"

function getISOWeek(d: Date) {
  const date = new Date(d); date.setHours(0,0,0,0)
  date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7)
  const week1 = new Date(date.getFullYear(), 0, 4)
  return 1 + Math.round(((date.getTime() - week1.getTime()) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7)
}

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
    const payload = await buildWebhookPayload(restaurant.id, restaurant.name, restaurant.currency, week, year)
    const body = buildBody({ ...payload, test: true }, restaurant.webhookUrl)
    const res = await fetch(restaurant.webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(10_000),
    })
    if (!res.ok) {
      return NextResponse.json({ error: `Le webhook a répondu avec le statut ${res.status}` }, { status: 502 })
    }
    return NextResponse.json({ success: true, status: res.status })
  } catch (e: any) {
    return NextResponse.json({ error: `Erreur de connexion : ${e.message}` }, { status: 502 })
  }
}
