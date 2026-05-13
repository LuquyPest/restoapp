import { redirect } from "next/navigation"
import { getAdminSession } from "@/lib/admin"
import LogsClient from "@/components/admin/LogsClient"

export default async function LogsPage() {
  const ok = await getAdminSession()
  if (!ok) redirect("/admin/login")
  return <LogsClient />
}
