import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const schema = z.object({
  name: z.string().min(1).max(100),
  contact: z.string().max(100).optional(),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().max(30).optional(),
  address: z.string().max(300).optional(),
})

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
  if (!["OWNER", "MANAGER"].includes(session.user.role)) return NextResponse.json({ error: "Interdit" }, { status: 403 })

  const { id } = await params
  const supplier = await prisma.supplier.findFirst({ where: { id, companyId: session.user.companyId } })
  if (!supplier) return NextResponse.json({ error: "Introuvable" }, { status: 404 })

  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: "Données invalides" }, { status: 400 })

  const updated = await prisma.supplier.update({
    where: { id },
    data: {
      name: parsed.data.name,
      contact: parsed.data.contact || null,
      email: parsed.data.email || null,
      phone: parsed.data.phone || null,
      address: parsed.data.address || null,
    },
  })
  return NextResponse.json(updated)
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
  if (!["OWNER", "MANAGER"].includes(session.user.role)) return NextResponse.json({ error: "Interdit" }, { status: 403 })

  const { id } = await params
  const supplier = await prisma.supplier.findFirst({
    where: { id, companyId: session.user.companyId },
    include: { _count: { select: { invoices: true } } },
  })
  if (!supplier) return NextResponse.json({ error: "Introuvable" }, { status: 404 })

  if (supplier._count.invoices > 0) {
    return NextResponse.json(
      { error: `Ce fournisseur a ${supplier._count.invoices} facture(s) liée(s). Supprimez-les d'abord.` },
      { status: 409 }
    )
  }

  await prisma.supplier.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
