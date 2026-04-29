import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  console.log("🌱 Démarrage du seed...")

  // Création du restaurant
  const restaurant = await prisma.restaurant.upsert({
    where: { id: "seed-restaurant" },
    update: {},
    create: {
      id: "seed-restaurant",
      name: "Mon Restaurant",
      currency: "$",
      taxRate: 10,
    },
  })
  console.log(`✅ Restaurant créé : ${restaurant.name}`)

  // Grades
  const grades = await Promise.all([
    prisma.grade.upsert({
      where: { id: "grade-owner" },
      update: {},
      create: { id: "grade-owner", name: "Patron", salaryPercent: 0, restaurantId: restaurant.id },
    }),
    prisma.grade.upsert({
      where: { id: "grade-manager" },
      update: {},
      create: { id: "grade-manager", name: "Manager", salaryPercent: 15, restaurantId: restaurant.id },
    }),
    prisma.grade.upsert({
      where: { id: "grade-server" },
      update: {},
      create: { id: "grade-server", name: "Serveur", salaryPercent: 10, restaurantId: restaurant.id },
    }),
  ])
  console.log(`✅ ${grades.length} grades créés`)

  // Compte patron
  const ownerHash = await bcrypt.hash("admin123", 12)
  const owner = await prisma.user.upsert({
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
  console.log(`✅ Compte patron créé : patron@resto.com / admin123`)

  // Employé de démo
  const empHash = await bcrypt.hash("emp123", 12)
  const empUser = await prisma.user.upsert({
    where: { email: "employe@resto.com" },
    update: {},
    create: {
      email: "employe@resto.com",
      name: "Marie Dupont",
      passwordHash: empHash,
      role: "EMPLOYEE",
      restaurantId: restaurant.id,
    },
  })

  await prisma.employee.upsert({
    where: { userId: empUser.id },
    update: {},
    create: {
      userId: empUser.id,
      restaurantId: restaurant.id,
      gradeId: grades[2].id,
      firstName: "Marie",
      lastName: "Dupont",
      phone: "06 12 34 56 78",
    },
  })
  console.log(`✅ Employé de démo créé : employe@resto.com / emp123`)

  // Carte de démo
  const menuItems = [
    { name: "Salade César", category: "Entrées", price: 8.5, description: "Laitue romaine, croûtons, parmesan" },
    { name: "Soupe du jour", category: "Entrées", price: 6.0, description: "Selon arrivage" },
    { name: "Burger maison", category: "Plats", price: 14.0, description: "Bœuf, cheddar, bacon, frites" },
    { name: "Entrecôte grillée", category: "Plats", price: 22.0, description: "250g, sauce au poivre" },
    { name: "Pâtes carbonara", category: "Plats", price: 12.0 },
    { name: "Tiramisu", category: "Desserts", price: 6.5 },
    { name: "Fondant chocolat", category: "Desserts", price: 7.0 },
    { name: "Coca-Cola", category: "Boissons", price: 3.0 },
    { name: "Eau minérale", category: "Boissons", price: 2.0 },
    { name: "Bière pression", category: "Boissons", price: 4.5 },
  ]

  for (const item of menuItems) {
    await prisma.menuItem.upsert({
      where: { id: `seed-${item.name.toLowerCase().replace(/\s/g, "-")}` },
      update: {},
      create: {
        id: `seed-${item.name.toLowerCase().replace(/\s/g, "-")}`,
        ...item,
        restaurantId: restaurant.id,
      },
    })
  }
  console.log(`✅ ${menuItems.length} articles de carte créés`)

  // Fournisseur de démo
  await prisma.supplier.upsert({
    where: { id: "seed-supplier" },
    update: {},
    create: {
      id: "seed-supplier",
      name: "ProFoods Distribution",
      contact: "Jean Martin",
      email: "contact@profoods.com",
      phone: "01 23 45 67 89",
      restaurantId: restaurant.id,
    },
  })
  console.log(`✅ Fournisseur de démo créé`)

  console.log("\n🎉 Seed terminé avec succès !")
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
  console.log("  Patron  : patron@resto.com / admin123")
  console.log("  Employé : employe@resto.com / emp123")
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
}

main()
  .catch((e) => {
    console.error("❌ Erreur seed :", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
