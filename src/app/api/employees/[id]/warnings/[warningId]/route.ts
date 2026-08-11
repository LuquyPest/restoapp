import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { getEmployeeForAccess } from "@/lib/employee-access"

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string; warningId: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
  if (session.user.role !== "OWNER") return NextResponse.json({ error: "Interdit" }, { status: 403 })
  const { id, warningId } = await params
  const { employee } = await getEmployeeForAccess(session, id, { allowSelf: false })
  if (!employee) return NextResponse.json({ error: "Introuvable" }, { status: 404 })

  const warning = await prisma.employeeWarning.findFirst({ where: { id: warningId, employeeId: id } })
  if (!warning) return NextResponse.json({ error: "Introuvable" }, { status: 404 })

  await prisma.employeeWarning.delete({ where: { id: warningId } })
  return NextResponse.json({ ok: true })
}
