import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const schema = z.object({
  supplierId: z.string(),
  reference: z.string().optional(),
  amount: z.number().positive(),
  dueDate: z.coerce.date(),
  note: z.string().optional(),
})

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 })

  const invoices = await prisma.invoice.findMany({
    where: { restaurantId: session.user.restaurantId },
    include: { supplier: true },
    orderBy: { createdAt: "desc" },
  })

  const now = new Date()
  const updated = invoices.map((inv) => {
    if (inv.status === "PENDING" && new Date(inv.dueDate) < now) {
      return { ...inv, status: "OVERDUE" as const }
    }
    return inv
  })

  return NextResponse.json(updated)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 })

  const { role, restaurantId } = session.user
  if (role === "EMPLOYEE") return NextResponse.json({ error: "Interdit" }, { status: 403 })

  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: "Données invalides" }, { status: 400 })

  const supplier = await prisma.supplier.findFirst({
    where: { id: parsed.data.supplierId, restaurantId },
  })
  if (!supplier) return NextResponse.json({ error: "Fournisseur introuvable" }, { status: 404 })

  const invoice = await prisma.invoice.create({
    data: {
      restaurantId,
      supplierId: parsed.data.supplierId,
      reference: parsed.data.reference,
      amount: parsed.data.amount,
      dueDate: parsed.data.dueDate,
      note: parsed.data.note,
    },
    include: { supplier: true },
  })

  return NextResponse.json(invoice, { status: 201 })
}
