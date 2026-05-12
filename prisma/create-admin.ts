import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  const email = process.env.ADMIN_EMAIL
  const password = process.env.ADMIN_PASSWORD

  if (!email || !password) {
    console.error("❌ ADMIN_EMAIL et ADMIN_PASSWORD requis dans le .env")
    process.exit(1)
  }

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    // Update password if already exists
    const hash = await bcrypt.hash(password, 12)
    await prisma.user.update({ where: { email }, data: { passwordHash: hash, role: "SUPERADMIN" } })
    console.log(`✅ Compte super admin mis à jour : ${email}`)
  } else {
    const hash = await bcrypt.hash(password, 12)
    await prisma.user.create({
      data: { email, name: "Super Admin", passwordHash: hash, role: "SUPERADMIN" },
    })
    console.log(`✅ Compte super admin créé : ${email}`)
  }
}

main().catch(e => { console.error(e); process.exit(1) }).finally(() => prisma.$disconnect())
