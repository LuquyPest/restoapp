import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { requirePageAccess } from "@/lib/page-access"
import ReportClient from "@/components/report/ReportClient"
import { prisma } from "@/lib/prisma"

export default async function ReportPage() {
  const session = await auth()
  if (!session) redirect("/login")
  const { role, companyId } = session.user
  await requirePageAccess(session, "report", ["OWNER"])
  const company = await prisma.company.findUnique({ where: { id: companyId } })
  return (
    <ReportClient
      currency={company?.currency ?? "$"}
      bonusRate={(company as any)?.bonusRate ?? 30}
      dividendRate={(company as any)?.dividendRate ?? 45}
      mairieZone={company?.mairieZone ?? null}
    />
  )
}
