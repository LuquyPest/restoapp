import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import { CONFIGURABLE_PAGES } from "@/lib/page-permissions"

const validKeys: string[] = CONFIGURABLE_PAGES.map(p => p.key)

const putSchema = z.object({
  pages: z.array(z.string()).transform(arr => arr.filter(p => validKeys.includes(p))),
})

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session || session.user.role !== "OWNER") return NextResponse.json({ error: "Interdit" }, { status: 403 })

  const { id } = await params
  const grade = await prisma.grade.findFirst({ where: { id, restaurantId: session.user.restaurantId }, include: { permissions: true } })
  if (!grade) return NextResponse.json({ error: "Introuvable" }, { status: 404 })

  return NextResponse.json(grade.permissions.map(p => p.page))
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session || session.user.role !== "OWNER") return NextResponse.json({ error: "Interdit" }, { status: 403 })

  const { id } = await params
  const grade = await prisma.grade.findFirst({ where: { id, restaurantId: session.user.restaurantId } })
  if (!grade) return NextResponse.json({ error: "Introuvable" }, { status: 404 })

  const body = await req.json()
  const parsed = putSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: "Données invalides" }, { status: 400 })

  // Replace all permissions for this grade
  await prisma.gradePermission.deleteMany({ where: { gradeId: id } })
  if (parsed.data.pages.length > 0) {
    await prisma.gradePermission.createMany({
      data: parsed.data.pages.map(page => ({ gradeId: id, page })),
    })
  }

  return NextResponse.json({ ok: true })
}
