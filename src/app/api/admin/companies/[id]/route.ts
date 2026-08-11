import { NextRequest, NextResponse } from "next/server"
import { getAdminSession } from "@/lib/admin"
import { prisma } from "@/lib/prisma"
import { log, getIp } from "@/lib/logger"
import { z } from "zod"
import { COMPANY_TYPES } from "@/lib/business-types"

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ok = await getAdminSession()
  if (!ok) return NextResponse.json({ error: "Non autorisé" }, { status: 401 })

  const { id } = await params

  const company = await prisma.company.findUnique({ where: { id } })
  if (!company) return NextResponse.json({ error: "Introuvable" }, { status: 404 })

  await prisma.orderLine.deleteMany({ where: { order: { companyId: id } } })
  await prisma.order.deleteMany({ where: { companyId: id } })
  await prisma.payroll.deleteMany({ where: { companyId: id } })
  await prisma.weeklyReport.deleteMany({ where: { companyId: id } })
  await prisma.invoice.deleteMany({ where: { companyId: id } })
  await prisma.supplier.deleteMany({ where: { companyId: id } })
  await prisma.charge.deleteMany({ where: { companyId: id } })
  await prisma.loyaltyCard.deleteMany({ where: { companyId: id } })
  await prisma.partner.deleteMany({ where: { companyId: id } })
  await prisma.employee.deleteMany({ where: { companyId: id } })
  await prisma.grade.deleteMany({ where: { companyId: id } })
  await prisma.menuItem.deleteMany({ where: { companyId: id } })
  await prisma.user.deleteMany({ where: { companyId: id } })
  await prisma.company.delete({ where: { id } })

  await log({
    action: "RESTAURANT_DELETED",
    ip: getIp(req.headers),
    metadata: { companyId: id, companyName: company.name },
  })
  return NextResponse.json({ ok: true })
}

const taxBracketSchema = z.object({ min: z.number().min(0), max: z.number().min(0).optional(), rate: z.number().min(0).max(100) })

const patchSchema = z.object({
  name: z.string().min(1).max(50).optional(),
  type: z.enum(COMPANY_TYPES).optional(),
  currency: z.string().min(1).max(5).optional(),
  taxType: z.enum(["TYPE1", "TYPE2", "TYPE3", "CUSTOM"]).optional(),
  taxBrackets: z.array(taxBracketSchema).optional().nullable(),
})

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ok = await getAdminSession()
  if (!ok) return NextResponse.json({ error: "Non autorisé" }, { status: 401 })

  const { id } = await params
  const body = await req.json()
  const parsed = patchSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: "Données invalides" }, { status: 400 })

  const company = await prisma.company.update({
    where: { id },
    data: {
      ...(parsed.data.name && { name: parsed.data.name }),
      ...(parsed.data.type && { type: parsed.data.type }),
      ...(parsed.data.currency && { currency: parsed.data.currency }),
      ...(parsed.data.taxType && { taxType: parsed.data.taxType }),
      ...(parsed.data.taxBrackets !== undefined && {
        taxBrackets: parsed.data.taxBrackets && parsed.data.taxBrackets.length > 0 ? JSON.stringify(parsed.data.taxBrackets) : null,
      }),
    },
  })
  return NextResponse.json(company)
}
