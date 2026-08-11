import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { isAuthorityRole, authorityZone } from "@/lib/authority"
import AuthorityDeclarationsClient from "@/components/authority/AuthorityDeclarationsClient"

export default async function AuthorityPage() {
  const session = await auth()
  if (!session) redirect("/login")
  const role = session.user.role
  if (!isAuthorityRole(role)) redirect("/login")

  const zone = authorityZone(role)

  const declarations = await prisma.taxDeclaration.findMany({
    where: zone ? { mairieZone: zone } : undefined,
    orderBy: [{ year: "desc" }, { weekNumber: "desc" }],
  })

  return <AuthorityDeclarationsClient declarations={declarations as any} />
}
