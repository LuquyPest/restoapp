import { NextRequest, NextResponse } from "next/server"
import { getAdminSession } from "@/lib/admin"
import { prisma } from "@/lib/prisma"
import { AUTHORITY_ROLES } from "@/lib/authority"
import { z } from "zod"

const patchSchema = z.object({ authorityReadOnly: z.boolean() })

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ok = await getAdminSession()
  if (!ok) return NextResponse.json({ error: "Non autorisé" }, { status: 401 })

  const { id } = await params
  const user = await prisma.user.findUnique({ where: { id } })
  if (!user || !(AUTHORITY_ROLES as readonly string[]).includes(user.role)) {
    return NextResponse.json({ error: "Introuvable" }, { status: 404 })
  }

  const parsed = patchSchema.safeParse(await req.json())
  if (!parsed.success) return NextResponse.json({ error: "Données invalides" }, { status: 400 })

  const updated = await prisma.user.update({
    where: { id },
    data: { authorityReadOnly: parsed.data.authorityReadOnly },
    select: { id: true, email: true, name: true, role: true, authorityReadOnly: true, createdAt: true },
  })
  return NextResponse.json(updated)
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ok = await getAdminSession()
  if (!ok) return NextResponse.json({ error: "Non autorisé" }, { status: 401 })

  const { id } = await params
  const user = await prisma.user.findUnique({ where: { id } })
  if (!user || !(AUTHORITY_ROLES as readonly string[]).includes(user.role)) {
    return NextResponse.json({ error: "Introuvable" }, { status: 404 })
  }

  await prisma.user.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
