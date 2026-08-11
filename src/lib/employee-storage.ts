import { promises as fs } from "fs"
import path from "path"
import { randomUUID } from "crypto"

const ROOT = process.env.UPLOADS_DIR ?? path.join(process.cwd(), "uploads")
export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024

export function sanitizeFilename(name: string): string {
  const clean = name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(-100)
  return clean || "document.pdf"
}

function employeeDir(companyId: string, employeeId: string): string {
  return path.join(ROOT, "employees", companyId, employeeId)
}

function resolveSafe(relativePath: string): string {
  const absolute = path.join(ROOT, relativePath)
  if (!absolute.startsWith(path.join(ROOT, path.sep)) && absolute !== ROOT) {
    throw new Error("Chemin de fichier invalide")
  }
  return absolute
}

export async function saveEmployeeFile(companyId: string, employeeId: string, file: File) {
  if (file.type !== "application/pdf") throw new Error("Seuls les fichiers PDF sont acceptés")
  if (file.size > MAX_FILE_SIZE_BYTES) throw new Error("Fichier trop volumineux (max 10 Mo)")

  const dir = employeeDir(companyId, employeeId)
  await fs.mkdir(dir, { recursive: true })

  const filename = `${randomUUID()}-${sanitizeFilename(file.name)}`
  const relativePath = path.join("employees", companyId, employeeId, filename)
  const buffer = Buffer.from(await file.arrayBuffer())
  await fs.writeFile(path.join(ROOT, relativePath), buffer)

  return { filePath: relativePath, fileSize: file.size, fileMimeType: file.type }
}

export async function readEmployeeFile(relativePath: string): Promise<Buffer> {
  return fs.readFile(resolveSafe(relativePath))
}

export async function deleteEmployeeFile(relativePath: string): Promise<void> {
  try {
    await fs.unlink(resolveSafe(relativePath))
  } catch (err: any) {
    if (err.code !== "ENOENT") throw err
  }
}
