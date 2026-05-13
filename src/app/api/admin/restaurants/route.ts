import { NextRequest, NextResponse } from "next/server"
import { getAdminSession, slugifyRestaurantName } from "@/lib/admin"
import { prisma } from "@/lib/prisma"
import { log, getIp } from "@/lib/logger"
import bcrypt from "bcryptjs"
import { z } from "zod"

const schema = z.object({
  name: z.string().min(1).max(50),
  ownerName: z.string().min(1),
  ownerPassword: z.string().min(6),
  currency: z.string().default("$"),
})

export async function GET() {
  const ok = await getAdminSession()
  if (!ok) return NextResponse.json({ error: "Non autorisé" }, { status: 401 })

  const restaurants = await prisma.restaurant.findMany({
    include: {
      _count: { select: { employees: true, orders: true } },
      users: { where: { role: "OWNER" }, select: { email: true, name: true } },
    },
    orderBy: { createdAt: "desc" },
  })
  return NextResponse.json(restaurants)
}

export async function POST(req: NextRequest) {
  const ok = await getAdminSession()
  if (!ok) return NextResponse.json({ error: "Non autorisé" }, { status: 401 })

  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: "Données invalides" }, { status: 400 })

  const { name, ownerName, ownerPassword, currency } = parsed.data
  const slug = slugifyRestaurantName(name)

  // Format email: prenom.nom@nomresto.com (sans espaces, sans accents)
  const ownerSlug = ownerName
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, ".")
    .replace(/[^a-z0-9.]/g, "")
  const email = `${ownerSlug}@${slug}.com`

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) return NextResponse.json({ error: `L'email ${email} est déjà utilisé` }, { status: 409 })

  const passwordHash = await bcrypt.hash(ownerPassword, 12)

  // Default grades
  const restaurant = await prisma.restaurant.create({
    data: {
      name,
      currency,
      taxRate: 11.9,
      bonusRate: 10,
      dividendRate: 72.26,
      grades: {
        create: [
          { name: "Patron(ne)", salaryPercent: 70 },
          { name: "Manager", salaryPercent: 65 },
          { name: "Employé CDI", salaryPercent: 65 },
          { name: "Employé CDD", salaryPercent: 50 },
        ],
      },
    },
    include: { grades: true },
  })

  const user = await prisma.user.create({
    data: {
      email,
      name: ownerName,
      passwordHash,
      role: "OWNER",
      restaurantId: restaurant.id,
    },
  })

  log({
    action: "RESTAURANT_CREATED",
    ip: getIp(req.headers),
    metadata: { restaurantId: restaurant.id, restaurantName: name, ownerEmail: email },
  })
  return NextResponse.json({ restaurant, email, user: { id: user.id, email, name: ownerName } }, { status: 201 })
}
