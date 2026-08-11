import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { getEmployeeForAccess } from "@/lib/employee-access"

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
  const { id } = await params
  const { employee, isSelf, allowed } = await getEmployeeForAccess(session, id)
  if (!employee) return NextResponse.json({ error: "Introuvable" }, { status: 404 })
  if (!allowed) return NextResponse.json({ error: "Interdit" }, { status: 403 })

  await prisma.employeeMessage.updateMany({
    where: {
      employeeId: id,
      ...(isSelf ? { readByEmployeeAt: null } : { readByManagerAt: null }),
    },
    data: isSelf ? { readByEmployeeAt: new Date() } : { readByManagerAt: new Date() },
  })
  return NextResponse.json({ ok: true })
}
