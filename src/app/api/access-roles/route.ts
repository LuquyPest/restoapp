import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const createSchema = z.object({ name: z.string().min(1).max(50) })

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session || session.user.role !== "OWNER") return NextResponse.json({ error: "Interdit" }, { status: 403 })
  const roles = await prisma.accessRole.findMany({
    where: { restaurantId: session.user.restaurantId },
    include: { permissions: true, users: { select: { id: true, name: true, email: true, role: true } } },
    orderBy: { createdAt: "asc" },
  })
  return NextResponse.json(roles)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session || session.user.role !== "OWNER") return NextResponse.json({ error: "Interdit" }, { status: 403 })
  const body = await req.json()
  const parsed = createSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: "Nom invalide" }, { status: 400 })
  const role = await prisma.accessRole.create({
    data: { name: parsed.data.name, restaurantId: session.user.restaurantId },
    include: { permissions: true, users: { select: { id: true, name: true, email: true, role: true } } },
  })
  return NextResponse.json(role, { status: 201 })
}
