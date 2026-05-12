import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import SuppliersClient from "@/components/suppliers/SuppliersClient"

export default async function SuppliersPage() {
  const session = await auth()
  if (!session) redirect("/login")
  const { restaurantId, role } = session.user
  if (role === "EMPLOYEE") redirect("/dashboard")

  const suppliers = await prisma.supplier.findMany({
    where: { restaurantId },
    include: { _count: { select: { invoices: true } } },
    orderBy: { name: "asc" },
  })

  return <SuppliersClient suppliers={suppliers} />
}
