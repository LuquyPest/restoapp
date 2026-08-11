import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { AUTHORITY_ROLES, getAuthorityUserIds } from "@/lib/authority"
import { upsertUserNotification } from "@/lib/notifications"
import { z } from "zod"
import type { UserRole } from "@prisma/client"

const roleSchema = z.enum(AUTHORITY_ROLES)

async function resolveThread(session: any, roleRaw: string | null) {
  if (session.user.role !== "OWNER") return { error: "Interdit", status: 403 as const }
  const parsedRole = roleSchema.safeParse(roleRaw)
  if (!parsedRole.success) return { error: "Rôle invalide", status: 400 as const }
  const companyId = session.user.companyId as string
  const company = await prisma.company.findUnique({ where: { id: companyId } })
  if (!company) return { error: "Introuvable", status: 404 as const }
  const role = parsedRole.data
  if (role !== "IRS") {
    const zone = role === "MAIRIE_NORD" ? "NORD" : "SUD"
    if (company.mairieZone !== zone) return { error: "Votre entreprise n'est pas rattachée à cette mairie", status: 403 as const }
  }
  return { companyId, role }
}

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
  const result = await resolveThread(session, new URL(req.url).searchParams.get("role"))
  if ("error" in result) return NextResponse.json({ error: result.error }, { status: result.status })

  const messages = await prisma.authorityMessage.findMany({
    where: { companyId: result.companyId, authorityRole: result.role as UserRole },
    orderBy: { createdAt: "asc" },
    take: 200,
  })
  return NextResponse.json(messages)
}

const createSchema = z.object({ role: roleSchema, body: z.string().min(1).max(4000) })

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 })

  const body = await req.json()
  const parsed = createSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: "Données invalides" }, { status: 400 })

  const result = await resolveThread(session, parsed.data.role)
  if ("error" in result) return NextResponse.json({ error: result.error }, { status: result.status })

  const message = await prisma.authorityMessage.create({
    data: {
      companyId: result.companyId, authorityRole: result.role as UserRole,
      authorUserId: session.user.id, fromAuthority: false, body: parsed.data.body,
      readByCompanyAt: new Date(),
    },
  })

  const company = await prisma.company.findUnique({ where: { id: result.companyId }, select: { name: true } })
  const recipientIds = await getAuthorityUserIds(result.role)
  await Promise.all(recipientIds.map(userId =>
    upsertUserNotification({
      companyId: result.companyId, type: "AUTHORITY_MESSAGE", entitySlug: `authmsg:${result.companyId}:${result.role}`,
      recipientUserId: userId, title: "Nouveau message",
      body: `${company?.name ?? "Une entreprise"} vous a écrit`,
      link: `/authority/companies/${result.companyId}?tab=messages`,
    })
  ))

  return NextResponse.json(message, { status: 201 })
}
