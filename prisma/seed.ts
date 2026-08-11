import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  console.log("🌱 Démarrage du seed...")

  const company = await prisma.company.upsert({
    where: { id: "seed-company" },
    update: {},
    create: {
      id: "seed-company",
      name: "Mon Établissement",
      currency: "$",
      taxRate: 11.9,
      bonusRate: 10,
      dividendRate: 72.26,
    },
  })
  console.log(`✅ Établissement : ${company.name}`)

  const grades = await Promise.all([
    prisma.grade.upsert({ where: { id: "grade-patron" }, update: {}, create: { id: "grade-patron", name: "Patron(ne)", salaryPercent: 70, companyId: company.id } }),
    prisma.grade.upsert({ where: { id: "grade-manager" }, update: {}, create: { id: "grade-manager", name: "Manager", salaryPercent: 65, companyId: company.id } }),
    prisma.grade.upsert({ where: { id: "grade-cdi" }, update: {}, create: { id: "grade-cdi", name: "Employé CDI", salaryPercent: 65, companyId: company.id } }),
    prisma.grade.upsert({ where: { id: "grade-cdd" }, update: {}, create: { id: "grade-cdd", name: "Employé CDD", salaryPercent: 50, companyId: company.id } }),
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
      companyId: company.id,
    },
  })

  console.log("\n🎉 Seed terminé !")
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
  console.log("  Patron : patron@resto.com / admin123")
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
}

main().catch(e => { console.error("❌", e); process.exit(1) }).finally(() => prisma.$disconnect())
