import { prisma } from "@/lib/prisma"
import { formatDate } from "@/lib/utils"

export async function upsertNotification(params: {
  companyId: string
  type: string
  entityId: string
  title: string
  body: string
  recipientUserId?: string
  link?: string
}) {
  await prisma.notification.upsert({
    where: { companyId_type_entityId: { companyId: params.companyId, type: params.type, entityId: params.entityId } },
    create: {
      companyId: params.companyId, type: params.type, entityId: params.entityId,
      title: params.title, body: params.body, recipientUserId: params.recipientUserId ?? null,
      link: params.link ?? null,
    },
    update: { isRead: false, title: params.title, body: params.body, link: params.link ?? null, createdAt: new Date() },
  })
}

// Notification "individuelle" — même événement, un destinataire précis.
// entityId incorpore le destinataire pour que chaque personne ait sa propre ligne
// (la contrainte d'unicité ne porte que sur companyId/type/entityId).
export async function upsertUserNotification(params: {
  companyId: string
  type: string
  entitySlug: string
  recipientUserId: string
  title: string
  body: string
  link?: string
}) {
  await upsertNotification({
    companyId: params.companyId,
    type: params.type,
    entityId: `${params.entitySlug}:${params.recipientUserId}`,
    title: params.title,
    body: params.body,
    recipientUserId: params.recipientUserId,
    link: params.link,
  })
}

export async function getCompanyManagerIds(companyId: string): Promise<string[]> {
  const managers = await prisma.user.findMany({
    where: { companyId, role: { in: ["OWNER", "MANAGER"] } },
    select: { id: true },
  })
  return managers.map(m => m.id)
}

export async function checkAndCreateDocumentExpiryNotifications(companyId: string) {
  const now = new Date()
  const soon = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
  const expiring = await prisma.employeeDocument.findMany({
    where: { companyId, expiresAt: { not: null, lte: soon } },
    include: { employee: true },
  })
  await Promise.all(
    expiring.map(doc =>
      upsertNotification({
        companyId,
        type: "DOCUMENT_EXPIRING",
        entityId: doc.id,
        title: "Document bientôt expiré",
        body: `${doc.title} — ${doc.employee.firstName} ${doc.employee.lastName} · expire le ${formatDate(doc.expiresAt!)}`,
        link: `/employees/${doc.employeeId}?tab=documents`,
      })
    )
  )
}

export async function checkAndCreateInvoiceNotifications(companyId: string) {
  const now = new Date()
  const overdueInvoices = await prisma.invoice.findMany({
    where: { companyId, deletedAt: null, status: { not: "PAID" }, dueDate: { lt: now } },
    include: { supplier: true },
  })
  await Promise.all(
    overdueInvoices.map(inv =>
      upsertNotification({
        companyId,
        type: "OVERDUE_INVOICE",
        entityId: inv.id,
        title: "Facture en retard",
        body: `Facture ${inv.reference ?? inv.id.slice(-6)} — ${inv.supplier.name} · ${inv.amount.toLocaleString("fr-FR", { minimumFractionDigits: 2 })}`,
        link: "/invoices",
      })
    )
  )
}
