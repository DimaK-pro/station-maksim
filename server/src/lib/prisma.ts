import { PrismaClient } from '@prisma/client';

// Singleton — один инстанс на весь процесс
const prisma = new PrismaClient();

export default prisma;
