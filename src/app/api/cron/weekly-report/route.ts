import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { buildWebhookPayload, sendWebhook } from "@/lib/webhook-payload"
import { generateReportPdf } from "@/lib/report-pdf"

function getISOWeek(d: Date) {
  const date = new Date(d); date.setHours(0,0,0,0)
  date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7)
  const week1 = new Date(date.getFullYear(), 0, 4)
  return 1 + Math.round(((date.getTime() - week1.getTime()) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7)
}

function getISODay(d: Date): number {
  return d.getDay() === 0 ? 7 : d.getDay()
}

export async function POST(req: NextRequest) {
  const secret = process.env.CRON_SECRET
  const auth = req.headers.get("authorization")
  if (!secret || auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
  }

  const now = new Date()
  const currentDay = getISODay(now)
  const currentHour = now.getHours()

  let week = getISOWeek(now) - 1
  let year = now.getFullYear()
  if (week < 1) { week = 52; year-- }

  const restaurants = await prisma.restaurant.findMany({
    where: {
      webhookUrl: { not: null },
      webhookDay: currentDay,
      webhookHour: currentHour,
    },
    select: { id: true, name: true, currency: true, webhookUrl: true },
  })

  const results: { restaurant: string; status: string }[] = []

  for (const restaurant of restaurants) {
    if (!restaurant.webhookUrl) continue
    try {
      const payload = await buildWebhookPayload(restaurant.id, restaurant.name, restaurant.currency, week, year)
      const pdfBuffer = await generateReportPdf(payload)
      const status = await sendWebhook(restaurant.webhookUrl, payload, pdfBuffer)
      results.push({ restaurant: restaurant.name, status })
    } catch (e: any) {
      results.push({ restaurant: restaurant.name, status: `failed: ${e.message}` })
    }
  }

  return NextResponse.json({ week, year, currentDay, currentHour, sent: results.length, results })
}
