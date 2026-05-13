import { prisma } from "@/lib/prisma"

export async function checkRateLimit(key: string, limit = 5, windowMs = 60_000): Promise<boolean> {
  const now = new Date()

  const existing = await prisma.rateLimit.findUnique({ where: { key } })

  if (!existing || existing.resetAt < now) {
    await prisma.rateLimit.upsert({
      where: { key },
      create: { key, count: 1, resetAt: new Date(Date.now() + windowMs) },
      update: { count: 1, resetAt: new Date(Date.now() + windowMs) },
    })
    return true
  }

  if (existing.count >= limit) return false

  await prisma.rateLimit.update({
    where: { key },
    data: { count: { increment: 1 } },
  })
  return true
}
