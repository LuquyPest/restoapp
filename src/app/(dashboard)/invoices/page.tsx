import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { requirePageAccess } from "@/lib/page-access"
import { prisma } from "@/lib/prisma"
import InvoicesClient from "@/components/invoices/InvoicesClient"

export default async function InvoicesPage() {
  const session = await auth()
  if (!session) redirect("/login")
  const { companyId, role } = session.user
  await requirePageAccess(session, "invoices", ["OWNER", "MANAGER"])

  const [invoices, suppliers, company] = await Promise.all([
    prisma.invoice.findMany({
      where: { companyId },
      include: { supplier: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.supplier.findMany({ where: { companyId }, orderBy: { name: "asc" } }),
    prisma.company.findUnique({ where: { id: companyId } }),
  ])

  const now = new Date()
  const enriched = invoices.map((inv) => ({
    ...inv,
    status: inv.status === "PENDING" && new Date(inv.dueDate) < now ? "OVERDUE" : inv.status,
  }))

  return <InvoicesClient invoices={enriched as any} suppliers={suppliers} currency={company?.currency ?? "$"} />
}
