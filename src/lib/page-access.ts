import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"

interface Session {
  user: { id: string; role: string }
}

async function userHasPageAccess(session: Session, pageKey: string, defaultAllowedRoles: string[]): Promise<boolean> {
  if (session.user.role === "OWNER") return true
  if (defaultAllowedRoles.includes(session.user.role)) {
    // Role already has default access — still check if a custom role might restrict it
    // (no restriction logic here — default role access is additive)
    return true
  }
  // Role doesn't have default access — check custom access role
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { accessRole: { include: { permissions: true } } },
  })
  return user?.accessRole?.permissions.some(p => p.page === pageKey) ?? false
}

// For page server components — redirects if no access
export async function requirePageAccess(session: Session, pageKey: string, defaultAllowedRoles: string[]) {
  const allowed = await userHasPageAccess(session, pageKey, defaultAllowedRoles)
  if (!allowed) redirect("/dashboard")
}

// For API routes — returns true if allowed, false if not
export async function checkApiPageAccess(session: Session, pageKey: string, defaultAllowedRoles: string[]): Promise<boolean> {
  return userHasPageAccess(session, pageKey, defaultAllowedRoles)
}
