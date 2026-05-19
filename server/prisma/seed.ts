import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const DEFAULT_CHEST_ITEMS = [
  { chestType: 'reward', level: 1, icon: '🎮', title: '30 минут игры' },
  { chestType: 'reward', level: 1, icon: '🍕', title: 'Любимый перекус' },
  { chestType: 'reward', level: 1, icon: '⭐', title: 'Выбор семейной игры' },
  { chestType: 'reward', level: 2, icon: '🎬', title: 'Семейный киносеанс' },
  { chestType: 'reward', level: 2, icon: '🎨', title: 'Набор для творчества' },
  { chestType: 'reward', level: 2, icon: '🚗', title: 'Поездка в любимое место' },
  { chestType: 'reward', level: 3, icon: '🍿', title: 'Поход в кино' },
  { chestType: 'reward', level: 3, icon: '🧸', title: 'Новая игрушка' },
  { chestType: 'reward', level: 3, icon: '🏖️', title: 'Семейная прогулка' },
  { chestType: 'reward', level: 4, icon: '🎉', title: 'Большой семейный праздник' },
  { chestType: 'reward', level: 4, icon: '💰', title: 'Крупная копилка мечты' },
  { chestType: 'reward', level: 4, icon: '🏆', title: 'Особая награда командира' },
  { chestType: 'consequence', level: 1, icon: '🧹', title: 'Помочь с уборкой' },
  { chestType: 'consequence', level: 1, icon: '📵', title: 'Пауза от экрана' },
  { chestType: 'consequence', level: 1, icon: '📝', title: 'Записать план исправления' },
  { chestType: 'consequence', level: 2, icon: '📚', title: 'Дополнительное чтение' },
  { chestType: 'consequence', level: 2, icon: '🍽️', title: 'Помочь накрыть на стол' },
  { chestType: 'consequence', level: 2, icon: '😶', title: 'Тихий час без споров' },
  { chestType: 'consequence', level: 3, icon: '🛏️', title: 'Ранний отбой' },
  { chestType: 'consequence', level: 3, icon: '🚫', title: 'День без сладкого' },
  { chestType: 'consequence', level: 3, icon: '🏃', title: 'Полезная прогулка' },
  { chestType: 'consequence', level: 4, icon: '⚠️', title: 'Семейный разбор ситуации' },
  { chestType: 'consequence', level: 4, icon: '📵', title: 'День без гаджетов' },
  { chestType: 'consequence', level: 4, icon: '🧹', title: 'Большая помощь по дому' },
] as const;

async function main() {
  console.log('Seeding database...');

  // Create System User (for cron jobs)
  await prisma.user.upsert({
    where: { id: 0 },
    update: {},
    create: {
      id: 0,
      role: 'system',
      pinHash: await bcrypt.hash('system_no_login', 10),
    },
  });

  // Create actual users
  const users = [
    { role: 'papa', pin: '1111' },
    { role: 'mama', pin: '2222' },
    { role: 'babushka', pin: '3333' },
  ];

  for (const u of users) {
    const existing = await prisma.user.findFirst({ where: { role: u.role } });
    if (!existing) {
      await prisma.user.create({
        data: {
          role: u.role,
          pinHash: await bcrypt.hash(u.pin, 10),
        },
      });
    }
  }

  // Create Settings (ensure id 1 exists)
  await prisma.settings.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
    },
  });

  const settings = await prisma.settings.findUnique({ where: { id: 1 } });
  if (settings?.weightsGood === '5,10,20,30,50' || settings?.weightsBad === '-5,-10,-20,-30,-50') {
    await prisma.settings.update({
      where: { id: 1 },
      data: {
        ...(settings.weightsGood === '5,10,20,30,50' ? { weightsGood: '5,10,20,35,50' } : {}),
        ...(settings.weightsBad === '-5,-10,-20,-30,-50' ? { weightsBad: '-5,-10,-20,-35,-50' } : {}),
      },
    });
  }

  // Create a practical default chest catalog without duplicating it on repeated seeds.
  for (const item of DEFAULT_CHEST_ITEMS) {
    const existing = await prisma.chestItem.findFirst({
      where: {
        chestType: item.chestType,
        level: item.level,
        title: item.title,
      },
    });

    if (!existing) {
      await prisma.chestItem.create({
        data: {
          ...item,
          createdAt: new Date(),
        },
      });
    }
  }

  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
