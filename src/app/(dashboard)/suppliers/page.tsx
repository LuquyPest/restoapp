import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { requirePageAccess } from "@/lib/page-access"
import { prisma } from "@/lib/prisma"
import SuppliersClient from "@/components/suppliers/SuppliersClient"

export default async function SuppliersPage() {
  const session = await auth()
  if (!session) redirect("/login")
  const { restaurantId, role } = session.user
  await requirePageAccess(session, "suppliers", ["OWNER", "MANAGER"])

  const suppliers = await prisma.supplier.findMany({
    where: { restaurantId },
    include: { _count: { select: { invoices: true } } },
    orderBy: { name: "asc" },
  })

  return <SuppliersClient suppliers={suppliers} />
}
