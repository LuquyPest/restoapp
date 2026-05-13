import { NextRequest, NextResponse } from "next/server"
import { getAdminSession } from "@/lib/admin"
import { log, getIp } from "@/lib/logger"

export async function POST(req: NextRequest) {
  const isAdmin = await getAdminSession()
  if (isAdmin) {
    await log({ action: "ADMIN_LOGOUT", ip: getIp(req.headers) })
  }
  const res = NextResponse.json({ ok: true })
  res.cookies.delete("admin_token")
  return res
}
