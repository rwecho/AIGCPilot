const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const cats = await prisma.category.findMany({
    include: {
      _count: {
        select: { tools: true }
      }
    },
    orderBy: {
      _count: {
        tools: 'desc'
      }
    }
  });
  console.log(JSON.stringify(cats, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
