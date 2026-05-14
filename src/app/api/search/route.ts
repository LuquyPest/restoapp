import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 })

  const q = new URL(req.url).searchParams.get("q")?.trim() ?? ""
  if (q.length < 2) return NextResponse.json({ employees: [], menuItems: [], invoices: [], orders: [] })

  const { restaurantId, role } = session.user
  const search = { contains: q }

  const [employees, menuItems, invoices, orders] = await Promise.all([
    role !== "EMPLOYEE"
      ? prisma.employee.findMany({
          where: { restaurantId, isActive: true, OR: [{ firstName: search }, { lastName: search }] },
          select: { id: true, firstName: true, lastName: true },
          take: 5,
        })
      : [],
    prisma.menuItem.findMany({
      where: { restaurantId, deletedAt: null, OR: [{ name: search }, { category: search }] },
      select: { id: true, name: true, category: true, price: true },
      take: 5,
    }),
    role !== "EMPLOYEE"
      ? prisma.invoice.findMany({
          where: {
            restaurantId, deletedAt: null,
            OR: [{ reference: search }, { supplier: { name: search } }],
          },
          include: { supplier: { select: { name: true } } },
          take: 5,
        })
      : [],
    prisma.order.findMany({
      where: {
        restaurantId,
        OR: [
          { employee: { OR: [{ firstName: search }, { lastName: search }] } },
          { note: search },
        ],
      },
      select: { id: true, total: true, createdAt: true, employee: { select: { firstName: true, lastName: true } } },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
  ])

  return NextResponse.json({ employees, menuItems, invoices, orders })
}
