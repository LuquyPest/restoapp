import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  const email = process.env.ADMIN_EMAIL
  const password = process.env.ADMIN_PASSWORD

  if (!email || !password) {
    console.log("ADMIN_EMAIL / ADMIN_PASSWORD non définis, création admin ignorée")
    return
  }

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    if (existing.role !== "SUPERADMIN") {
      await prisma.user.update({ where: { email }, data: { role: "SUPERADMIN" } })
      console.log(`Rôle mis à jour en SUPERADMIN : ${email}`)
    } else {
      console.log(`Admin déjà existant : ${email}`)
    }
    return
  }

  const hash = await bcrypt.hash(password, 12)
  await prisma.user.create({
    data: { email, name: "Super Admin", passwordHash: hash, role: "SUPERADMIN" },
  })
  console.log(`Admin créé : ${email}`)
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
