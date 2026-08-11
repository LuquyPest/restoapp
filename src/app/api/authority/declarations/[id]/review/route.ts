import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { isAuthorityRole, authorityZone } from "@/lib/authority"
import { log, getIp } from "@/lib/logger"
import { z } from "zod"

const schema = z.object({
  reviewStatus: z.enum(["PENDING", "REVIEWED", "FLAGGED"]),
  reviewNotes: z.string().max(2000).optional().nullable(),
})

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
  const role = session.user.role
  if (!isAuthorityRole(role)) return NextResponse.json({ error: "Interdit" }, { status: 403 })
  if (session.user.authorityReadOnly) return NextResponse.json({ error: "Compte en lecture seule" }, { status: 403 })

  const { id } = await params
  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: "Données invalides" }, { status: 400 })

  const zone = authorityZone(role)
  const declaration = await prisma.taxDeclaration.findFirst({
    where: { id, ...(zone ? { mairieZone: zone } : {}) },
  })
  if (!declaration) return NextResponse.json({ error: "Introuvable" }, { status: 404 })

  const updated = await prisma.taxDeclaration.update({
    where: { id },
    data: {
      reviewStatus: parsed.data.reviewStatus,
      reviewNotes: parsed.data.reviewNotes ?? null,
      reviewedByUserId: session.user.id,
      reviewedAt: new Date(),
    },
  })

  await log({
    action: "DECLARATION_REVIEWED",
    userId: session.user.id,
    userEmail: session.user.email ?? undefined,
    ip: getIp(req.headers),
    metadata: { declarationId: id, companyId: declaration.companyId, status: parsed.data.reviewStatus },
  })

  return NextResponse.json(updated)
}
