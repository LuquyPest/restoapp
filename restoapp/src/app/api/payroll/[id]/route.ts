import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 })

  const { role, restaurantId } = session.user
  if (role === "EMPLOYEE") return NextResponse.json({ error: "Interdit" }, { status: 403 })

  const payroll = await prisma.payroll.findFirst({
    where: { id: params.id, restaurantId },
  })
  if (!payroll) return NextResponse.json({ error: "Introuvable" }, { status: 404 })

  const body = await req.json()
  const updated = await prisma.payroll.update({
    where: { id: params.id },
    data: {
      isPaid: body.isPaid ?? true,
      paidAt: body.isPaid ? new Date() : null,
    },
  })

  return NextResponse.json(updated)
}
