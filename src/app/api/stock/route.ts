import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { checkApiPageAccess } from "@/lib/page-access"
import { z } from "zod"

const createSchema = z.object({
  name: z.string().min(1).max(200),
  quantity: z.number().min(0),
  minQuantity: z.number().min(0),
  imageUrl: z.string().url().max(2000).nullable().optional(),
})

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
  if (!await checkApiPageAccess(session, "stock", ["OWNER"])) return NextResponse.json({ error: "Interdit" }, { status: 403 })

  const ingredients = await prisma.ingredient.findMany({
    where: { companyId: session.user.companyId },
    orderBy: { name: "asc" },
  })
  return NextResponse.json(ingredients)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
  if (!await checkApiPageAccess(session, "stock", ["OWNER"])) return NextResponse.json({ error: "Interdit" }, { status: 403 })

  const body = await req.json()
  const parsed = createSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: "Données invalides" }, { status: 400 })

  const ingredient = await prisma.ingredient.create({
    data: {
      companyId: session.user.companyId,
      name: parsed.data.name,
      quantity: parsed.data.quantity,
      minQuantity: parsed.data.minQuantity,
      imageUrl: parsed.data.imageUrl ?? null,
    },
  })
  return NextResponse.json(ingredient, { status: 201 })
}
