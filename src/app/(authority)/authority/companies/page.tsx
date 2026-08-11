import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { isAuthorityRole, authorityZone } from "@/lib/authority"
import AuthorityCompaniesClient from "@/components/authority/AuthorityCompaniesClient"

export default async function AuthorityCompaniesPage() {
  const session = await auth()
  if (!session) redirect("/login")
  const role = session.user.role
  if (!isAuthorityRole(role)) redirect("/login")

  const zone = authorityZone(role)

  const companies = await prisma.company.findMany({
    where: zone ? { mairieZone: zone } : undefined,
    orderBy: { name: "asc" },
  })
  const companyIds = companies.map(c => c.id)

  const [reports, declarations] = await Promise.all([
    prisma.weeklyReport.findMany({
      where: { companyId: { in: companyIds } },
      select: { companyId: true, weekNumber: true, year: true },
    }),
    prisma.taxDeclaration.findMany({
      where: { companyId: { in: companyIds } },
      select: { companyId: true, weekNumber: true, year: true, declaredAt: true },
    }),
  ])

  const declaredSet = new Set(declarations.map(d => `${d.companyId}:${d.weekNumber}:${d.year}`))
  const lastDeclaredMap = new Map<string, Date>()
  for (const d of declarations) {
    const prev = lastDeclaredMap.get(d.companyId)
    if (!prev || d.declaredAt > prev) lastDeclaredMap.set(d.companyId, d.declaredAt)
  }

  const rows = companies.map(c => {
    const missingWeeks = reports.filter(r => r.companyId === c.id && !declaredSet.has(`${r.companyId}:${r.weekNumber}:${r.year}`)).length
    return {
      id: c.id, name: c.name, type: c.type, mairieZone: c.mairieZone, currency: c.currency,
      declaredCount: declarations.filter(d => d.companyId === c.id).length,
      lastDeclaredAt: lastDeclaredMap.get(c.id)?.toISOString() ?? null,
      missingWeeks,
    }
  })

  return <AuthorityCompaniesClient companies={rows} showZone={!zone} />
}
