import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { getEmployeeForAccess } from "@/lib/employee-access"
import { readEmployeeFile } from "@/lib/employee-storage"

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string; docId: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
  const { id, docId } = await params
  const { employee, allowed } = await getEmployeeForAccess(session, id)
  if (!employee) return NextResponse.json({ error: "Introuvable" }, { status: 404 })
  if (!allowed) return NextResponse.json({ error: "Interdit" }, { status: 403 })

  const document = await prisma.employeeDocument.findFirst({ where: { id: docId, employeeId: id } })
  if (!document || document.kind !== "FILE" || !document.filePath) {
    return NextResponse.json({ error: "Introuvable" }, { status: 404 })
  }

  let buffer: Buffer
  try {
    buffer = await readEmployeeFile(document.filePath)
  } catch {
    return NextResponse.json({ error: "Fichier introuvable" }, { status: 404 })
  }

  const download = new URL(req.url).searchParams.get("download") === "1"
  const filename = `${document.title.replace(/[^a-zA-Z0-9._ -]/g, "_")}.pdf`

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": document.fileMimeType ?? "application/pdf",
      "Content-Disposition": `${download ? "attachment" : "inline"}; filename="${filename}"`,
      "Cache-Control": "private, no-store",
    },
  })
}
