import { auth } from "@/lib/auth"
import { redirect, notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { isAuthorityRole, authorityZone } from "@/lib/authority"
import { log, getIp } from "@/lib/logger"
import { headers } from "next/headers"
import AuthorityCompanyDetailClient from "@/components/authority/AuthorityCompanyDetailClient"

export default async function AuthorityCompanyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) redirect("/login")
  const role = session.user.role
  if (!isAuthorityRole(role)) redirect("/login")

  const { id } = await params
  const zone = authorityZone(role)

  const company = await prisma.company.findFirst({
    where: { id, ...(zone ? { mairieZone: zone } : {}) },
  })
  if (!company) notFound()

  const declarations = await prisma.taxDeclaration.findMany({
    where: { companyId: id },
    orderBy: [{ year: "desc" }, { weekNumber: "desc" }],
  })

  const hdrs = await headers()
  await log({
    action: "DECLARATION_VIEWED",
    userId: session.user.id,
    userEmail: session.user.email ?? undefined,
    ip: getIp(hdrs),
    metadata: { companyId: id, companyName: company.name },
  })

  return (
    <AuthorityCompanyDetailClient
      company={{ id: company.id, name: company.name, type: company.type, currency: company.currency, mairieZone: company.mairieZone }}
      declarations={declarations as any}
    />
  )
}
