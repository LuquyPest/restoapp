import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import ReportClient from "@/components/report/ReportClient"
import { prisma } from "@/lib/prisma"

export default async function ReportPage() {
  const session = await auth()
  if (!session) redirect("/login")
  const { role, restaurantId } = session.user
  if (role !== "OWNER") redirect("/dashboard")
  const restaurant = await prisma.restaurant.findUnique({ where: { id: restaurantId } })
  return (
    <ReportClient
      currency={restaurant?.currency ?? "$"}
      taxRate={restaurant?.taxRate ?? 11.9}
      bonusRate={(restaurant as any)?.bonusRate ?? 10}
      dividendRate={(restaurant as any)?.dividendRate ?? 72.26}
    />
  )
}
