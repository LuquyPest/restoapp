const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

const email = process.argv[2]
const password = process.argv[3]

if (!email || !password) {
  console.error('Usage: node prisma/create-admin.js <email> <password>')
  process.exit(1)
}

async function main() {
  const hash = await bcrypt.hash(password, 12)
  const existing = await prisma.user.findUnique({ where: { email } })

  if (existing) {
    await prisma.user.update({ where: { email }, data: { passwordHash: hash, role: 'SUPERADMIN' } })
    console.log('✅ Compte super admin mis à jour :', email)
  } else {
    await prisma.user.create({
      data: { id: 'superadmin-1', email, name: 'Super Admin', passwordHash: hash, role: 'SUPERADMIN' }
    })
    console.log('✅ Compte super admin créé :', email)
  }
}

main().catch(console.error).finally(() => prisma.$disconnect())
