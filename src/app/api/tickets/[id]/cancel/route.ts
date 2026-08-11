import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { getOrCreateOrderEmployee } from "@/lib/order-employee"
import { restoreOrderStock } from "@/lib/order-stock"
import { log, getIp } from "@/lib/logger"

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
  const { id } = await params
  const { companyId } = session.user

  const ticket = await prisma.order.findFirst({ where: { id, companyId }, include: { lines: true } })
  if (!ticket) return NextResponse.json({ error: "Introuvable" }, { status: 404 })
  if (!["NEW", "CLAIMED", "IN_PROGRESS"].includes(ticket.status)) {
    return NextResponse.json({ error: "Cette commande ne peut plus être annulée" }, { status: 409 })
  }

  let employee
  try {
    employee = await getOrCreateOrderEmployee(session)
  } catch (e: any) {
    return NextResponse.json({ error: e.message ?? "Erreur" }, { status: 400 })
  }

  const updated = await prisma.order.update({
    where: { id },
    data: { status: "CANCELLED", closedByEmployeeId: employee.id, closedAt: new Date() },
  })

  await restoreOrderStock(ticket.lines)

  await log({
    action: "TICKET_CANCELLED", userId: session.user.id, userEmail: session.user.email ?? undefined,
    companyId: companyId ?? undefined, ip: getIp(req.headers), metadata: { orderId: id },
  })

  return NextResponse.json(updated)
}
