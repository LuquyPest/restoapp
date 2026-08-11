import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { getEmployeeForAccess } from "@/lib/employee-access"
import { saveEmployeeFile } from "@/lib/employee-storage"
import { isValidGoogleLink } from "@/lib/google-docs"

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
  const { id } = await params
  const { employee, allowed } = await getEmployeeForAccess(session, id)
  if (!employee) return NextResponse.json({ error: "Introuvable" }, { status: 404 })
  if (!allowed) return NextResponse.json({ error: "Interdit" }, { status: 403 })

  const documents = await prisma.employeeDocument.findMany({
    where: { employeeId: id },
    orderBy: { createdAt: "desc" },
  })
  return NextResponse.json(documents)
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
  const { id } = await params
  const { employee, canManage } = await getEmployeeForAccess(session, id, { allowSelf: false })
  if (!employee) return NextResponse.json({ error: "Introuvable" }, { status: 404 })
  if (!canManage) return NextResponse.json({ error: "Interdit" }, { status: 403 })

  const form = await req.formData()
  const title = String(form.get("title") ?? "").trim()
  const kind = String(form.get("kind") ?? "")
  const expiresAtRaw = form.get("expiresAt")
  const expiresAt = expiresAtRaw ? new Date(String(expiresAtRaw)) : null
  if (expiresAt && isNaN(expiresAt.getTime())) return NextResponse.json({ error: "Date d'expiration invalide" }, { status: 400 })

  if (!title || title.length > 200) return NextResponse.json({ error: "Titre invalide" }, { status: 400 })
  if (kind !== "FILE" && kind !== "LINK") return NextResponse.json({ error: "Type de document invalide" }, { status: 400 })

  const companyId = session.user.companyId!

  if (kind === "FILE") {
    const file = form.get("file")
    if (!(file instanceof File) || file.size === 0) return NextResponse.json({ error: "Fichier manquant" }, { status: 400 })
    let saved
    try {
      saved = await saveEmployeeFile(companyId, id, file)
    } catch (e: any) {
      return NextResponse.json({ error: e.message ?? "Échec de l'upload" }, { status: 400 })
    }
    const document = await prisma.employeeDocument.create({
      data: {
        companyId, employeeId: id, title, kind: "FILE",
        filePath: saved.filePath, fileMimeType: saved.fileMimeType, fileSize: saved.fileSize,
        expiresAt, uploadedByUserId: session.user.id,
      },
    })
    return NextResponse.json(document, { status: 201 })
  }

  const externalUrl = String(form.get("externalUrl") ?? "").trim()
  if (!externalUrl || !isValidGoogleLink(externalUrl)) {
    return NextResponse.json({ error: "Lien Google non reconnu. Formats acceptés : Google Docs, Sheets, Slides ou Drive." }, { status: 400 })
  }
  const document = await prisma.employeeDocument.create({
    data: { companyId, employeeId: id, title, kind: "LINK", externalUrl, expiresAt, uploadedByUserId: session.user.id },
  })
  return NextResponse.json(document, { status: 201 })
}
