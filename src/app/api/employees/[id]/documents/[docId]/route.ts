import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { getEmployeeForAccess } from "@/lib/employee-access"
import { deleteEmployeeFile } from "@/lib/employee-storage"

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string; docId: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
  const { id, docId } = await params
  const { employee, canManage } = await getEmployeeForAccess(session, id, { allowSelf: false })
  if (!employee) return NextResponse.json({ error: "Introuvable" }, { status: 404 })
  if (!canManage) return NextResponse.json({ error: "Interdit" }, { status: 403 })

  const document = await prisma.employeeDocument.findFirst({ where: { id: docId, employeeId: id } })
  if (!document) return NextResponse.json({ error: "Introuvable" }, { status: 404 })

  await prisma.employeeDocument.delete({ where: { id: docId } })
  if (document.filePath) await deleteEmployeeFile(document.filePath)

  return NextResponse.json({ ok: true })
}
