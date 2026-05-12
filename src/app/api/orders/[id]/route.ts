import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 })

  const { role, restaurantId } = session.user
  if (role === "EMPLOYEE") return NextResponse.json({ error: "Interdit" }, { status: 403 })

  const { id } = await params
  const body = await req.json()
  const { status } = body

  if (!["CONFIRMED", "CANCELLED"].includes(status)) {
    return NextResponse.json({ error: "Statut invalide" }, { status: 400 })
  }

  const order = await prisma.order.findFirst({ where: { id, restaurantId } })
  if (!order) return NextResponse.json({ error: "Commande introuvable" }, { status: 404 })

  const updated = await prisma.order.update({ where: { id }, data: { status } })

  return NextResponse.json(updated)
}
