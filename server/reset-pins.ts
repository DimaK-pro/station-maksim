import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  await prisma.user.updateMany({
    where: { role: 'papa' },
    data: { pinHash: await bcrypt.hash('1111', 10) }
  });
  await prisma.user.updateMany({
    where: { role: 'mama' },
    data: { pinHash: await bcrypt.hash('2222', 10) }
  });
  await prisma.user.updateMany({
    where: { role: 'babushka' },
    data: { pinHash: await bcrypt.hash('3333', 10) }
  });
  console.log("Pins updated successfully!");
}

main().finally(() => prisma.$disconnect());
