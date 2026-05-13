import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import { CONFIGURABLE_PAGES } from "@/lib/page-permissions"

const validKeys: string[] = CONFIGURABLE_PAGES.map(p => p.key)

const putSchema = z.object({
  name: z.string().min(1).max(50).optional(),
  pages: z.array(z.string()).optional(),
  userIds: z.array(z.string()).optional(),
})

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session || session.user.role !== "OWNER") return NextResponse.json({ error: "Interdit" }, { status: 403 })

  const { id } = await params
  const role = await prisma.accessRole.findFirst({ where: { id, restaurantId: session.user.restaurantId } })
  if (!role) return NextResponse.json({ error: "Introuvable" }, { status: 404 })

  const body = await req.json()
  const parsed = putSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: "Données invalides" }, { status: 400 })

  const { name, pages, userIds } = parsed.data

  await prisma.$transaction(async tx => {
    if (name) await tx.accessRole.update({ where: { id }, data: { name } })

    if (pages !== undefined) {
      await tx.accessPermission.deleteMany({ where: { accessRoleId: id } })
      const validPages = pages.filter(p => validKeys.includes(p))
      if (validPages.length > 0) {
        await tx.accessPermission.createMany({ data: validPages.map(page => ({ accessRoleId: id, page })) })
      }
    }

    if (userIds !== undefined) {
      // Remove this role from all current users of this restaurant
      await tx.user.updateMany({ where: { accessRoleId: id, restaurantId: session.user.restaurantId }, data: { accessRoleId: null } })
      // Assign to new users (only restaurant members)
      if (userIds.length > 0) {
        await tx.user.updateMany({ where: { id: { in: userIds }, restaurantId: session.user.restaurantId }, data: { accessRoleId: id } })
      }
    }
  })

  const updated = await prisma.accessRole.findUnique({
    where: { id },
    include: { permissions: true, users: { select: { id: true, name: true, email: true, role: true } } },
  })
  return NextResponse.json(updated)
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session || session.user.role !== "OWNER") return NextResponse.json({ error: "Interdit" }, { status: 403 })

  const { id } = await params
  const role = await prisma.accessRole.findFirst({ where: { id, restaurantId: session.user.restaurantId } })
  if (!role) return NextResponse.json({ error: "Introuvable" }, { status: 404 })

  await prisma.accessRole.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
