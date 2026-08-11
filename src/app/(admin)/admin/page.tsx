import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { verifyAdminToken } from "@/lib/admin"
import AdminClient from "@/components/admin/AdminClient"
import { prisma } from "@/lib/prisma"

export default async function AdminPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get("admin_token")?.value
  if (!token || !(await verifyAdminToken(token))) {
    redirect("/admin/login")
  }
  const companies = await prisma.company.findMany({
    include: {
      _count: { select: { employees: true, orders: true } },
      users: { where: { role: "OWNER" }, select: { email: true, name: true } },
    },
    orderBy: { createdAt: "desc" },
  })
  return <AdminClient companies={companies as any} />
}
