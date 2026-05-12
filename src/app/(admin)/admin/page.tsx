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
  const restaurants = await prisma.restaurant.findMany({
    include: {
      _count: { select: { employees: true, orders: true } },
      users: { where: { role: "OWNER" }, select: { email: true, name: true } },
    },
    orderBy: { createdAt: "desc" },
  })
  return <AdminClient restaurants={restaurants as any} />
}
