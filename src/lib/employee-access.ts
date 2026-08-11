import { prisma } from "@/lib/prisma"
import type { Session } from "next-auth"

interface EmployeeAccessResult {
  employee: Awaited<ReturnType<typeof prisma.employee.findFirst>>
  isSelf: boolean
  canManage: boolean
  allowed: boolean
}

interface EmployeeAccessOptions {
  allowSelf?: boolean
  allowManage?: boolean
}

export async function getEmployeeForAccess(
  session: Session,
  employeeId: string,
  options: EmployeeAccessOptions = {}
): Promise<EmployeeAccessResult> {
  const { allowSelf = true, allowManage = true } = options
  const { role, companyId, id: userId } = session.user

  const employee = await prisma.employee.findFirst({ where: { id: employeeId, companyId } })
  if (!employee) return { employee: null, isSelf: false, canManage: false, allowed: false }

  const isSelf = employee.userId === userId
  const canManage = role === "OWNER" || role === "MANAGER"
  const allowed = (allowSelf && isSelf) || (allowManage && canManage)

  return { employee, isSelf, canManage, allowed }
}
