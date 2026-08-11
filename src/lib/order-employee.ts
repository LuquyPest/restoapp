import { prisma } from "@/lib/prisma"
import type { Session } from "next-auth"

// Résout l'Employee du compte connecté, en le créant si besoin (ex: OWNER/MANAGER
// qui n'ont normalement pas de fiche employé) — nécessaire pour attribuer une commande.
export async function getOrCreateOrderEmployee(session: Session) {
  const { companyId } = session.user
  let employee = await prisma.employee.findFirst({ where: { userId: session.user.id } })
  if (!employee) {
    const grade = await prisma.grade.findFirst({ where: { companyId } })
    if (!grade) throw new Error("Aucun grade configuré")
    employee = await prisma.employee.create({
      data: {
        userId: session.user.id, companyId: companyId!, gradeId: grade.id,
        firstName: session.user.name?.split(" ")[0] ?? "Patron",
        lastName: session.user.name?.split(" ").slice(1).join(" ") ?? "",
      },
    })
  }
  return employee
}
