import { NextRequest, NextResponse } from "next/server"
import { getAdminSession, slugifyCompanyName } from "@/lib/admin"
import { prisma } from "@/lib/prisma"
import { log, getIp } from "@/lib/logger"
import { COMPANY_TYPES, BUSINESS_VOCAB } from "@/lib/business-types"
import bcrypt from "bcryptjs"
import { z } from "zod"
import { randomBytes } from "crypto"

const taxBracketSchema = z.object({ min: z.number().min(0), max: z.number().min(0).optional(), rate: z.number().min(0).max(100) })

const schema = z.object({
  name: z.string().min(1).max(50),
  ownerName: z.string().min(1),
  type: z.enum(COMPANY_TYPES).default("RESTO_BAR"),
  currency: z.string().default("$"),
  taxType: z.enum(["TYPE1", "TYPE2", "TYPE3", "CUSTOM"]).default("TYPE3"),
  taxBrackets: z.array(taxBracketSchema).optional(),
})

export async function GET() {
  const ok = await getAdminSession()
  if (!ok) return NextResponse.json({ error: "Non autorisé" }, { status: 401 })

  const companies = await prisma.company.findMany({
    include: {
      _count: { select: { employees: true, orders: true } },
      users: { where: { role: "OWNER" }, select: { email: true, name: true } },
    },
    orderBy: { createdAt: "desc" },
  })
  return NextResponse.json(companies)
}

export async function POST(req: NextRequest) {
  const ok = await getAdminSession()
  if (!ok) return NextResponse.json({ error: "Non autorisé" }, { status: 401 })

  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: "Données invalides" }, { status: 400 })

  const { name, ownerName, type, currency, taxType, taxBrackets } = parsed.data
  const ownerPassword = randomBytes(12).toString("base64url")
  const slug = slugifyCompanyName(name)

  const ownerSlug = ownerName
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/\s+/g, ".")
    .replace(/[^a-z0-9.]/g, "")
  const email = `${ownerSlug}@${slug}.com`

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) return NextResponse.json({ error: `L'email ${email} est déjà utilisé` }, { status: 409 })

  const passwordHash = await bcrypt.hash(ownerPassword, 12)

  const company = await prisma.company.create({
    data: {
      name,
      type,
      currency,
      taxRate: 11.9,
      bonusRate: 10,
      dividendRate: 72.26,
      taxType: taxType ?? "TYPE3",
      taxBrackets: taxBrackets && taxBrackets.length > 0 ? JSON.stringify(taxBrackets) : null,
      grades: {
        create: BUSINESS_VOCAB[type].defaultGrades,
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
      companyId: company.id,
    },
  })

  await log({
    action: "RESTAURANT_CREATED",
    ip: getIp(req.headers),
    metadata: { companyId: company.id, companyName: name, ownerEmail: email },
  })
  return NextResponse.json({ company, email, password: ownerPassword, user: { id: user.id, email, name: ownerName } }, { status: 201 })
}
