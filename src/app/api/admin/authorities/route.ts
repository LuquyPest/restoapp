import { NextRequest, NextResponse } from "next/server"
import { getAdminSession } from "@/lib/admin"
import { prisma } from "@/lib/prisma"
import { AUTHORITY_ROLES } from "@/lib/authority"
import bcrypt from "bcryptjs"
import { z } from "zod"
import { randomBytes } from "crypto"

export async function GET() {
  const ok = await getAdminSession()
  if (!ok) return NextResponse.json({ error: "Non autorisé" }, { status: 401 })

  const users = await prisma.user.findMany({
    where: { role: { in: [...AUTHORITY_ROLES] } },
    select: { id: true, email: true, name: true, role: true, authorityReadOnly: true, createdAt: true },
    orderBy: [{ role: "asc" }, { createdAt: "desc" }],
  })
  return NextResponse.json(users)
}

const schema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  role: z.enum(AUTHORITY_ROLES),
  authorityReadOnly: z.boolean().optional(),
})

export async function POST(req: NextRequest) {
  const ok = await getAdminSession()
  if (!ok) return NextResponse.json({ error: "Non autorisé" }, { status: 401 })

  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: "Données invalides" }, { status: 400 })
  const { name, email, role, authorityReadOnly } = parsed.data

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) return NextResponse.json({ error: `L'email ${email} est déjà utilisé` }, { status: 409 })

  const password = randomBytes(12).toString("base64url")
  const passwordHash = await bcrypt.hash(password, 12)

  const user = await prisma.user.create({
    data: { name, email, role, passwordHash, authorityReadOnly: authorityReadOnly ?? false },
  })

  return NextResponse.json({ id: user.id, email, name, role, password }, { status: 201 })
}
