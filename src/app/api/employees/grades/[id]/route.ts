import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const schema = z.object({
  name: z.string().min(1).optional(),
  salaryPercent: z.number().min(0).max(100).optional(),
  dividendPercent: z.number().min(0).max(100).optional(),
})

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
  const { role, restaurantId } = session.user
  if (role === "EMPLOYEE") return NextResponse.json({ error: "Interdit" }, { status: 403 })
  const { id } = await params
  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: "Données invalides" }, { status: 400 })
  const grade = await prisma.grade.findFirst({ where: { id, restaurantId } })
  if (!grade) return NextResponse.json({ error: "Introuvable" }, { status: 404 })
  const updated = await prisma.grade.update({ where: { id }, data: parsed.data })
  return NextResponse.json(updated)
}
