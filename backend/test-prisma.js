import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  try {
    const projects = await prisma.project.findMany()
    console.log("Projects in Prisma:", projects.map(p => ({ id: p.id, title: p.title, ownerId: p.ownerId })))
  } catch (e) {
    console.error("Prisma error:", e)
  } finally {
    await prisma.$disconnect()
  }
}

main()
