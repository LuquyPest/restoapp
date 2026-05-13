import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const schema = z.object({
  name: z.string().min(1),
  amount: z.number().positive(),
  type: z.enum(["DEDUCTIBLE", "NON_DEDUCTIBLE"]).optional(),
  isActive: z.boolean().optional(),
  weekNumber: z.number().int().optional().nullable(),
  year: z.number().int().optional().nullable(),
})

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
  if (session.user.role === "EMPLOYEE") return NextResponse.json({ error: "Interdit" }, { status: 403 })

  const url = new URL(req.url)
  const weekParam = url.searchParams.get("week")
  const yearParam = url.searchParams.get("year")
  let week: number | null = null
  let year: number | null = null
  if (weekParam !== null || yearParam !== null) {
    const w = parseInt(weekParam ?? "")
    const y = parseInt(yearParam ?? "")
    if (!Number.isInteger(w) || w < 1 || w > 53 || !Number.isInteger(y) || y < 2020 || y > 2099) {
      return NextResponse.json({ error: "Paramètres invalides" }, { status: 400 })
    }
    week = w; year = y
  }

  let where: any = { restaurantId: session.user.restaurantId, deletedAt: null }
  if (week && year) {
    where = {
      restaurantId: session.user.restaurantId,
      deletedAt: null,
      OR: [
        { weekNumber: null, year: null },
        { weekNumber: week, year: year },
      ]
    }
  }

  const charges = await prisma.charge.findMany({ where, orderBy: { createdAt: "desc" } })
  return NextResponse.json(charges)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
  const { role, restaurantId } = session.user
  if (role === "EMPLOYEE") return NextResponse.json({ error: "Interdit" }, { status: 403 })
  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: "Données invalides" }, { status: 400 })
  const charge = await prisma.charge.create({
    data: {
      name: parsed.data.name,
      amount: parsed.data.amount,
      type: parsed.data.type ?? "DEDUCTIBLE",
      isActive: parsed.data.isActive ?? true,
      weekNumber: parsed.data.weekNumber ?? null,
      year: parsed.data.year ?? null,
      restaurantId,
    }
  })
  return NextResponse.json(charge, { status: 201 })
}
