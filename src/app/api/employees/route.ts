import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { log, getIp } from "@/lib/logger"
import bcrypt from "bcryptjs"
import { z } from "zod"

const createSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
  gradeId: z.string(),
  phone: z.string().max(30).optional(),
  accountNumber: z.string().max(50).optional(),
})

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
  const { role, restaurantId } = session.user
  if (role === "EMPLOYEE") return NextResponse.json({ error: "Interdit" }, { status: 403 })
  const body = await req.json()
  const parsed = createSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: "Données invalides" }, { status: 400 })
  const { firstName, lastName, email, password, gradeId, phone, accountNumber } = parsed.data
  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) return NextResponse.json({ error: "Cet email est déjà utilisé" }, { status: 409 })
  const grade = await prisma.grade.findFirst({ where: { id: gradeId, restaurantId } })
  if (!grade) return NextResponse.json({ error: "Grade introuvable" }, { status: 404 })
  const passwordHash = await bcrypt.hash(password, 12)
  const user = await prisma.user.create({
    data: {
      email, name: `${firstName} ${lastName}`, passwordHash,
      role: "EMPLOYEE", restaurantId,
      employee: {
        create: { firstName, lastName, phone: phone || null, accountNumber: accountNumber || null, restaurantId, gradeId },
      },
    },
    include: { employee: { include: { grade: true } } },
  })
  await log({
    action: "EMPLOYEE_CREATED",
    userId: session.user.id,
    userEmail: session.user.email ?? undefined,
    restaurantId,
    ip: getIp(req.headers),
    metadata: { employeeEmail: email, employeeName: `${firstName} ${lastName}` },
  })
  return NextResponse.json(user.employee, { status: 201 })
}
