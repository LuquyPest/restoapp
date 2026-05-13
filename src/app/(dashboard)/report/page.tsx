import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { requirePageAccess } from "@/lib/page-access"
import ReportClient from "@/components/report/ReportClient"
import { prisma } from "@/lib/prisma"

export default async function ReportPage() {
  const session = await auth()
  if (!session) redirect("/login")
  const { role, restaurantId } = session.user
  await requirePageAccess(session, "report", ["OWNER"])
  const restaurant = await prisma.restaurant.findUnique({ where: { id: restaurantId } })
  return (
    <ReportClient
      currency={restaurant?.currency ?? "$"}
      bonusRate={(restaurant as any)?.bonusRate ?? 30}
      dividendRate={(restaurant as any)?.dividendRate ?? 45}
    />
  )
}
