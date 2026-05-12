import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  console.log("🌱 Démarrage du seed...")

  const restaurant = await prisma.restaurant.upsert({
    where: { id: "seed-restaurant" },
    update: {},
    create: {
      id: "seed-restaurant",
      name: "Mon Restaurant",
      currency: "$",
      taxRate: 11.9,
      bonusRate: 10,
      dividendRate: 72.26,
    },
  })
  console.log(`✅ Restaurant : ${restaurant.name}`)

  const grades = await Promise.all([
    prisma.grade.upsert({ where: { id: "grade-patron" }, update: {}, create: { id: "grade-patron", name: "Patron(ne)", salaryPercent: 70, restaurantId: restaurant.id } }),
    prisma.grade.upsert({ where: { id: "grade-manager" }, update: {}, create: { id: "grade-manager", name: "Manager", salaryPercent: 65, restaurantId: restaurant.id } }),
    prisma.grade.upsert({ where: { id: "grade-cdi" }, update: {}, create: { id: "grade-cdi", name: "Employé CDI", salaryPercent: 65, restaurantId: restaurant.id } }),
    prisma.grade.upsert({ where: { id: "grade-cdd" }, update: {}, create: { id: "grade-cdd", name: "Employé CDD", salaryPercent: 50, restaurantId: restaurant.id } }),
  ])
  console.log(`✅ ${grades.length} grades créés`)

  const ownerHash = await bcrypt.hash("admin123", 12)
  await prisma.user.upsert({
    where: { email: "patron@resto.com" },
    update: {},
    create: {
      email: "patron@resto.com",
      name: "Patron Principal",
      passwordHash: ownerHash,
      role: "OWNER",
      restaurantId: restaurant.id,
    },
  })

  console.log("\n🎉 Seed terminé !")
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
  console.log("  Patron : patron@resto.com / admin123")
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
}

main().catch(e => { console.error("❌", e); process.exit(1) }).finally(() => prisma.$disconnect())
