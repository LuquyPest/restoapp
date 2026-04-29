import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 })

  const { role, restaurantId } = session.user
  if (role === "EMPLOYEE") return NextResponse.json({ error: "Interdit" }, { status: 403 })

  const invoice = await prisma.invoice.findFirst({ where: { id: params.id, restaurantId } })
  if (!invoice) return NextResponse.json({ error: "Introuvable" }, { status: 404 })

  const body = await req.json()
  const updated = await prisma.invoice.update({
    where: { id: params.id },
    data: {
      status: body.status ?? "PAID",
      paidAt: body.status === "PAID" ? new Date() : null,
    },
  })

  return NextResponse.json(updated)
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 })

  const { role, restaurantId } = session.user
  if (role !== "OWNER") return NextResponse.json({ error: "Interdit" }, { status: 403 })

  await prisma.invoice.deleteMany({ where: { id: params.id, restaurantId } })
  return NextResponse.json({ ok: true })
}
