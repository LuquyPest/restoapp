import { redirect } from "next/navigation"
import { getAdminSession } from "@/lib/admin"
import { prisma } from "@/lib/prisma"
import CompanyLogsClient from "@/components/admin/CompanyLogsClient"

export default async function CompanyLogsPage({ params }: { params: Promise<{ companyId: string }> }) {
  const ok = await getAdminSession()
  if (!ok) redirect("/admin/login")

  const { companyId } = await params
  const company = await prisma.company.findUnique({
    where: { id: companyId },
    select: { id: true, name: true },
  })
  if (!company) redirect("/admin")

  return <CompanyLogsClient companyId={company.id} companyName={company.name} />
}
