import { prisma } from "@/lib/prisma"

export async function upsertNotification(params: {
  restaurantId: string
  type: string
  entityId: string
  title: string
  body: string
}) {
  await prisma.notification.upsert({
    where: { restaurantId_type_entityId: { restaurantId: params.restaurantId, type: params.type, entityId: params.entityId } },
    create: { restaurantId: params.restaurantId, type: params.type, entityId: params.entityId, title: params.title, body: params.body },
    update: { isRead: false, title: params.title, body: params.body, createdAt: new Date() },
  })
}

export async function checkAndCreateInvoiceNotifications(restaurantId: string) {
  const now = new Date()
  const overdueInvoices = await prisma.invoice.findMany({
    where: { restaurantId, deletedAt: null, status: { not: "PAID" }, dueDate: { lt: now } },
    include: { supplier: true },
  })
  await Promise.all(
    overdueInvoices.map(inv =>
      upsertNotification({
        restaurantId,
        type: "OVERDUE_INVOICE",
        entityId: inv.id,
        title: "Facture en retard",
        body: `Facture ${inv.reference ?? inv.id.slice(-6)} — ${inv.supplier.name} · ${inv.amount.toLocaleString("fr-FR", { minimumFractionDigits: 2 })}`,
      })
    )
  )
}
