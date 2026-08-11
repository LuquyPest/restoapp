import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { isAuthorityRole, authorityZone } from "@/lib/authority"
import { upsertUserNotification } from "@/lib/notifications"
import { z } from "zod"
import type { UserRole } from "@prisma/client"

async function resolveCompany(session: any, companyId: string) {
  const role = session.user.role
  if (!isAuthorityRole(role)) return { error: "Interdit", status: 403 as const }
  const zone = authorityZone(role)
  const company = await prisma.company.findFirst({
    where: { id: companyId, ...(zone ? { mairieZone: zone } : {}) },
  })
  if (!company) return { error: "Introuvable", status: 404 as const }
  return { company, role }
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ companyId: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
  const { companyId } = await params
  const result = await resolveCompany(session, companyId)
  if ("error" in result) return NextResponse.json({ error: result.error }, { status: result.status })

  const messages = await prisma.authorityMessage.findMany({
    where: { companyId, authorityRole: result.role as UserRole },
    orderBy: { createdAt: "asc" },
    take: 200,
  })
  return NextResponse.json(messages)
}

const createSchema = z.object({ body: z.string().min(1).max(4000) })

export async function POST(req: NextRequest, { params }: { params: Promise<{ companyId: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
  if (session.user.authorityReadOnly) return NextResponse.json({ error: "Compte en lecture seule" }, { status: 403 })

  const { companyId } = await params
  const result = await resolveCompany(session, companyId)
  if ("error" in result) return NextResponse.json({ error: result.error }, { status: result.status })

  const body = await req.json()
  const parsed = createSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: "Données invalides" }, { status: 400 })

  const message = await prisma.authorityMessage.create({
    data: {
      companyId, authorityRole: result.role as UserRole,
      authorUserId: session.user.id, fromAuthority: true, body: parsed.data.body,
      readByAuthorityAt: new Date(),
    },
  })

  const owners = await prisma.user.findMany({ where: { companyId, role: "OWNER" }, select: { id: true } })
  await Promise.all(owners.map(o =>
    upsertUserNotification({
      companyId, type: "AUTHORITY_MESSAGE_RECEIVED", entitySlug: `authmsgto:${companyId}:${result.role}`,
      recipientUserId: o.id, title: "Nouveau message",
      body: `${session.user.name ?? "Une autorité"} vous a écrit`,
      link: `/report?tab=messages&authority=${result.role}`,
    })
  ))

  return NextResponse.json(message, { status: 201 })
}
