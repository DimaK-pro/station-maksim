const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.spinResult.findMany({ include: { chestItem: true } }).then(res => { console.log(JSON.stringify(res, null, 2)); prisma.$disconnect(); });
