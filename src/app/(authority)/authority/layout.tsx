import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { isAuthorityRole, AUTHORITY_ROLE_LABELS } from "@/lib/authority"
import AuthorityShell from "@/components/authority/AuthorityShell"

export default async function AuthorityLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session) redirect("/login")
  if (!isAuthorityRole(session.user.role)) redirect("/login")

  const notifications = await prisma.notification.findMany({
    where: { recipientUserId: session.user.id, isRead: false },
    orderBy: { createdAt: "desc" },
    take: 50,
  })

  return (
    <AuthorityShell
      roleLabel={AUTHORITY_ROLE_LABELS[session.user.role]}
      userName={session.user.name ?? session.user.email}
      initialNotifications={notifications.map(n => ({ ...n, createdAt: n.createdAt.toISOString() }))}
    >
      {children}
    </AuthorityShell>
  )
}
