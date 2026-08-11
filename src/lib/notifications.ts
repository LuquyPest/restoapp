import { prisma } from "@/lib/prisma"

export async function upsertNotification(params: {
  companyId: string
  type: string
  entityId: string
  title: string
  body: string
}) {
  await prisma.notification.upsert({
    where: { companyId_type_entityId: { companyId: params.companyId, type: params.type, entityId: params.entityId } },
    create: { companyId: params.companyId, type: params.type, entityId: params.entityId, title: params.title, body: params.body },
    update: { isRead: false, title: params.title, body: params.body, createdAt: new Date() },
  })
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
      })
    )
  )
}
