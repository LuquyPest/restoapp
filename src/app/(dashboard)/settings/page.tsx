import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import SettingsClient from "@/components/settings/SettingsClient"

export default async function SettingsPage() {
  const session = await auth()
  if (!session) redirect("/login")
  const { companyId, role } = session.user
  if (role !== "OWNER") redirect("/dashboard")
  const company = await prisma.company.findUnique({ where: { id: companyId } })
  if (!company) redirect("/login")
  const accessRoles = await prisma.accessRole.findMany({
    where: { companyId },
    include: { permissions: true, users: { select: { id: true, name: true, email: true, role: true } } },
    orderBy: { createdAt: "asc" },
  })
  const companyUsers = await prisma.user.findMany({
    where: { companyId, role: { not: "OWNER" } },
    select: { id: true, name: true, email: true, role: true },
    orderBy: { name: "asc" },
  })
  return <SettingsClient company={company as any} accessRoles={accessRoles as any} companyUsers={companyUsers as any} webhookUrl={(company as any).webhookUrl ?? ""} webhookDay={(company as any).webhookDay ?? 1} webhookHour={(company as any).webhookHour ?? 1} stockAlertWebhookUrl={(company as any).stockAlertWebhookUrl ?? ""} />
}
