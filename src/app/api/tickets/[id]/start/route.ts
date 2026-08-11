import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
  const { id } = await params
  const { companyId } = session.user

  const ticket = await prisma.order.findFirst({ where: { id, companyId } })
  if (!ticket) return NextResponse.json({ error: "Introuvable" }, { status: 404 })
  if (ticket.status !== "CLAIMED") return NextResponse.json({ error: "Cette commande doit d'abord être prise en charge" }, { status: 409 })

  const updated = await prisma.order.update({ where: { id }, data: { status: "IN_PROGRESS" } })
  return NextResponse.json(updated)
}
