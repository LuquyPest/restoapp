import { redirect } from "next/navigation"
import { getAdminSession } from "@/lib/admin"
import { prisma } from "@/lib/prisma"
import { AUTHORITY_ROLES } from "@/lib/authority"
import AuthorityAccountsClient from "@/components/admin/AuthorityAccountsClient"

export default async function AuthorityAccountsPage() {
  const ok = await getAdminSession()
  if (!ok) redirect("/admin/login")

  const users = await prisma.user.findMany({
    where: { role: { in: [...AUTHORITY_ROLES] } },
    select: { id: true, email: true, name: true, role: true, authorityReadOnly: true, createdAt: true },
    orderBy: [{ role: "asc" }, { createdAt: "desc" }],
  })

  return <AuthorityAccountsClient users={users as any} />
}
