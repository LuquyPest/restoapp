import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { checkApiPageAccess } from "@/lib/page-access"
import { saveWeeklyReport } from "@/lib/bilan"
import { z } from "zod"

const declareSchema = z.object({
  week: z.number().int().min(1).max(53),
  year: z.number().int().min(2020).max(2099),
})

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
  const { companyId } = session.user
  if (!await checkApiPageAccess(session, "report", ["OWNER"])) return NextResponse.json({ error: "Interdit" }, { status: 403 })

  const body = await req.json()
  const parsed = declareSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: "Données invalides" }, { status: 400 })
  const { week, year } = parsed.data

  const existing = await prisma.taxDeclaration.findUnique({
    where: { companyId_weekNumber_year: { companyId: companyId!, weekNumber: week, year } },
  })
  if (existing) return NextResponse.json({ error: "Cette semaine a déjà été déclarée" }, { status: 409 })

  let bilan, company
  try {
    ({ bilan, company } = await saveWeeklyReport(companyId!, week, year, { taxDeclared: true }))
  } catch (e: any) {
    return NextResponse.json({ error: e.message ?? "Erreur" }, { status: 404 })
  }

  const declaration = await prisma.taxDeclaration.create({
    data: {
      companyId: companyId!,
      companyName: company.name,
      currency: company.currency,
      weekNumber: week,
      year,
      revenue: bilan.revenue,
      costRevenue: bilan.costRevenue,
      salaries: bilan.totalSalaries,
      chargesDeductible: bilan.chargesDeductible,
      chargesNonDeductible: bilan.chargesNonDeductible,
      grossProfit: bilan.grossProfit,
      taxes: bilan.taxes,
      netProfit: bilan.netProfit,
      mairieZone: company.mairieZone,
      declaredByUserId: session.user.id,
    },
  })

  return NextResponse.json(declaration, { status: 201 })
}
