import { NextRequest, NextResponse } from "next/server"
import { getAdminSession } from "@/lib/admin"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
  const ok = await getAdminSession()
  if (!ok) return NextResponse.json({ error: "Non autorisé" }, { status: 401 })

  const url = new URL(req.url)
  const page = Math.max(1, parseInt(url.searchParams.get("page") ?? "1"))
  const action = url.searchParams.get("action") ?? ""
  const search = url.searchParams.get("search") ?? ""
  const perPage = 50

  const where: Record<string, unknown> = {}
  if (action) where.action = action
  if (search) {
    where.OR = [
      { userEmail: { contains: search } },
      { ip: { contains: search } },
      { metadata: { contains: search } },
    ]
  }

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * perPage,
      take: perPage,
    }),
    prisma.auditLog.count({ where }),
  ])

  return NextResponse.json({ logs, total, page, perPage })
}
