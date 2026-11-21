import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
await prisma.user.updateMany({
  where: { role: 'SUPER_ADMIN' },
  data: { name: 'Raj Patel' }
});
await prisma.siteSetting.upsert({
  where: { key: 'store_name' },
  update: { value: 'Rexpresso' },
  create: { key: 'store_name', value: 'Rexpresso', description: 'Site name' }
});
console.log('Done!');
await prisma.$disconnect();
