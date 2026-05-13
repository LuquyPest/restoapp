import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const patchSchema = z.object({
  status: z.enum(["PENDING", "PAID", "OVERDUE"]),
})

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 })

  const { role, restaurantId } = session.user
  if (role === "EMPLOYEE") return NextResponse.json({ error: "Interdit" }, { status: 403 })

  const { id } = await params
  const body = await req.json()
  const parsed = patchSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: "Statut invalide" }, { status: 400 })

  const invoice = await prisma.invoice.findFirst({ where: { id, restaurantId } })
  if (!invoice) return NextResponse.json({ error: "Introuvable" }, { status: 404 })

  const updated = await prisma.invoice.update({
    where: { id },
    data: {
      status: parsed.data.status,
      paidAt: parsed.data.status === "PAID" ? new Date() : null,
    },
  })

  return NextResponse.json(updated)
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 })

  const { role, restaurantId } = session.user
  if (role !== "OWNER") return NextResponse.json({ error: "Interdit" }, { status: 403 })

  const { id } = await params
  await prisma.invoice.deleteMany({ where: { id, restaurantId } })
  return NextResponse.json({ ok: true })
}
