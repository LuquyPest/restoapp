import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { isAuthorityRole, AUTHORITY_ROLE_LABELS } from "@/lib/authority"
import AuthorityShell from "@/components/authority/AuthorityShell"

export default async function AuthorityLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session) redirect("/login")
  if (!isAuthorityRole(session.user.role)) redirect("/login")

  return (
    <AuthorityShell roleLabel={AUTHORITY_ROLE_LABELS[session.user.role]} userName={session.user.name ?? session.user.email}>
      {children}
    </AuthorityShell>
  )
}
