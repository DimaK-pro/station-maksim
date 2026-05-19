# Задание — Этап 2: Бэкенд «Космическая Станция Максима»

## Ответ на вопрос про стек

Используем: **Node.js + Fastify + PostgreSQL + Prisma**.

- Никакого Firebase/Supabase — есть собственный VPS, данные семьи не уходят на сторонние сервисы
- Fastify быстрее Express, нативный JSON, удобный для REST API
- PostgreSQL — реляционная БД, идеально подходит под структуру данных проекта
- Prisma — ORM, генерирует типы, удобные миграции

---

## Структура проекта

Добавить папку `server/` в корень репозитория:

```
station-maksim/
├── src/                  ← существующий фронтенд (React + Vite)
├── server/
│   ├── prisma/
│   │   └── schema.prisma
│   ├── src/
│   │   ├── index.ts          ← точка входа Fastify
│   │   ├── routes/
│   │   │   ├── events.ts
│   │   │   ├── chests.ts
│   │   │   ├── auth.ts
│   │   │   ├── settings.ts
│   │   │   └── sse.ts
│   │   ├── services/
│   │   │   ├── energy.ts     ← формула E
│   │   │   └── streak.ts     ← счётчики дней в зоне
│   │   └── jobs/
│   │       └── decay.ts      ← ночное затухание
│   ├── package.json
│   └── tsconfig.json
├── docker-compose.yml
└── .env
```

---

## Шаг 1 — Схема базы данных (Prisma)

Создать файл `server/prisma/schema.prisma`:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// Родители и роли
model User {
  id        Int      @id @default(autoincrement())
  role      String   // "papa" | "mama" | "babushka"
  pinHash   String
  createdAt DateTime @default(now())
  events    Event[]
}

// Каждый поступок Максима
model Event {
  id        Int      @id @default(autoincrement())
  sphere    String   // "study" | "respect" | "focus" | "home"
  type      String   // "good" | "neutral" | "bad"
  weight    Int      // число из настроек (+5, +10, ... или -5, -10, ...)
  comment   String?
  author    User     @relation(fields: [authorId], references: [id])
  authorId  Int
  createdAt DateTime @default(now())
}

// Добавленные в барабан награды и последствия
model ChestItem {
  id        Int      @id @default(autoincrement())
  chestType String   // "reward" | "consequence"
  icon      String   // эмодзи: "🎮", "🧹" и т.д.
  level     Int      // 1 | 2 | 3 | 4
  title     String
  createdAt DateTime
}

// Записи о выпавших наградах/последствиях (журнал барабана)
model SpinResult {
  id          Int       @id @default(autoincrement())
  chestType   String    // "reward" | "consequence"
  chestItem   ChestItem @relation(fields: [chestItemId], references: [id])
  chestItemId Int
  createdAt   DateTime  @default(now())
}

// Настройки системы (одна строка в таблице, id=1)
model Settings {
  id               Int   @id @default(1)
  curveK           Float @default(30)    // делитель кривой
  decayCoeff       Float @default(0.92)  // коэффициент затухания
  thresholdPlus    Int   @default(50)    // порог плюса (E)
  thresholdMinus   Int   @default(-50)   // порог минуса (E)
  // Значения силы событий (5 штук каждого типа, через запятую)
  weightsGood      String @default("5,10,20,30,50")
  weightsNeutral   String @default("-2,-1,0,1,2")
  weightsBad       String @default("-5,-10,-20,-30,-50")
  // Дней в зоне для наград (4 уровня)
  rewardDays       String @default("1,7,14,30")
  // Дней в зоне для последствий (4 уровня)
  consequenceDays  String @default("1,3,7,14")
}
```

---

## Шаг 2 — Формула энергии (файл `server/src/services/energy.ts`)

```typescript
// Получить все события за последние 7 дней → посчитать S → применить формулу → вернуть E

export function calcEnergy(events: { weight: number; createdAt: Date }[], k: number): number {
  const now = new Date();
  const cutoff = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  
  // S = сумма весов событий за 7 дней
  const S = events
    .filter(e => e.createdAt >= cutoff)
    .reduce((sum, e) => sum + e.weight, 0);
  
  // E = логистическая кривая: от -100 до +100, никогда не достигает краёв
  const E = (200 / (1 + Math.exp(-S / k))) - 100;
  
  return Math.round(E * 10) / 10; // округлить до 1 знака
}

// Показатель по каждой сфере: среднее нормализованное значение 0–10
export function calcSphereScore(events: { sphere: string; weight: number; createdAt: Date }[], sphere: string, k: number): number {
  const sphereEvents = events.filter(e => e.sphere === sphere);
  const E = calcEnergy(sphereEvents, k);
  // Нормализовать от -100..+100 до 0..10
  return Math.round(((E + 100) / 200) * 10 * 10) / 10;
}
```

---

## Шаг 3 — API эндпоинты

### `POST /api/auth/login`
Тело: `{ role: "papa" | "mama" | "babushka", pin: "1234" }`
Ответ: `{ token: "jwt..." }` или `401`

Логика: bcrypt.compare(pin, user.pinHash) → если ок, выдать JWT на 30 дней.

```typescript
// JWT payload: { userId: number, role: string }
// Секрет: process.env.JWT_SECRET
```

---

### `GET /api/station`
Публичный (без авторизации — Максим видит без входа).

Ответ:
```json
{
  "energy": 47.3,
  "spheres": {
    "study": 8.2,
    "respect": 7.5,
    "focus": 6.8,
    "home": 9.0
  },
  "rewardChest": {
    "status": "locked" | "countdown" | "available",
    "daysLeft": 2,
    "level": 1
  },
  "consequenceChest": {
    "status": "locked" | "countdown" | "available",
    "daysLeft": null,
    "level": null
  }
}
```

---

### `POST /api/events` 🔒 (требует JWT)
Тело: `{ sphere, type, weight, comment }`
Логика: сохранить событие → пересчитать E → отправить SSE-обновление всем подключённым клиентам → вернуть новый стейт станции.

---

### `DELETE /api/events/:id` 🔒 (требует JWT)
Удалить событие → пересчитать E → отправить SSE.

---

### `GET /api/events`
Публичный. Query params: `?type=events|spins&limit=50`
Возвращает ленту для журнала (события + результаты барабана).

---

### `GET /api/chests`
Публичный. Возвращает все ChestItem, сгруппированные по type и level.

### `POST /api/chests` 🔒
Тело: `{ chestType, icon, level, title }`

### `DELETE /api/chests/:id` 🔒

---

### `POST /api/spin` 🔒 (требует JWT)
Тело: `{ chestType: "reward" | "consequence" }`
Логика: 
1. Определить текущий доступный уровень сундука
2. Случайно выбрать один ChestItem нужного типа и уровня
3. Сохранить SpinResult
4. Вернуть выпавший ChestItem

---

### `GET /api/settings` 🔒 (только papa)
Возвращает текущие настройки.

### `PUT /api/settings` 🔒 (только papa)
Обновить любые поля настроек.

---

### `GET /api/sse/station` (публичный, SSE)
Открытое SSE-соединение. Сервер пушит событие каждый раз когда меняется E:
```
data: {"energy":47.3,"spheres":{...},"rewardChest":{...},"consequenceChest":{...}}
```

На клиенте (уже в React):
```javascript
const es = new EventSource('/api/sse/station');
es.onmessage = (e) => updateStationState(JSON.parse(e.data));
```

---

## Шаг 4 — Ночное затухание (cron)

Файл `server/src/jobs/decay.ts`:

```typescript
import cron from 'node-cron';

// Каждый день в 00:00
cron.schedule('0 0 * * *', async () => {
  const settings = await prisma.settings.findUnique({ where: { id: 1 } });
  // Создать специальное "decay-событие" с весом = -(S * (1 - coeff))
  // Это эффективно умножает накопленный S на coeff
  // НЕ удалять реальные события — только добавить корректирующую запись
  const currentS = await calcCurrentS();
  const decayWeight = Math.round(currentS * (settings.decayCoeff - 1));
  await prisma.event.create({
    data: {
      sphere: 'system',
      type: 'decay',
      weight: decayWeight,
      authorId: 0, // системный пользователь
      comment: 'Ночное затухание'
    }
  });
});
```

---

## Шаг 5 — Docker Compose

Файл `docker-compose.yml` в корне репозитория:

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: station_maksim
      POSTGRES_USER: station
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  server:
    build: ./server
    environment:
      DATABASE_URL: postgresql://station:${DB_PASSWORD}@postgres:5432/station_maksim
      JWT_SECRET: ${JWT_SECRET}
      PORT: 3001
    ports:
      - "3001:3001"
    depends_on:
      - postgres

  frontend:
    build: .
    ports:
      - "80:80"
    environment:
      VITE_API_URL: http://localhost:3001

volumes:
  postgres_data:
```

---

## Шаг 6 — Переменные окружения

Файл `.env` (добавить в `.gitignore`!):

```env
DB_PASSWORD=придумать_сильный_пароль
JWT_SECRET=длинная_случайная_строка_32+символа
DATABASE_URL=postgresql://station:DB_PASSWORD@localhost:5432/station_maksim
```

---

## Шаг 7 — Начальные данные (seed)

Файл `server/prisma/seed.ts`:

```typescript
// Создать трёх пользователей с дефолтными PIN-кодами:
// Папа: 1111
// Мама: 2222
// Бабушка: 3333
// + создать запись Settings с дефолтными значениями
```

---

## Порядок выполнения

1. Инициализировать `server/` — `npm init`, установить зависимости (`fastify`, `@prisma/client`, `prisma`, `bcrypt`, `jose`, `node-cron`, `typescript`)
2. Создать `schema.prisma`, запустить `npx prisma migrate dev --name init`
3. Запустить seed → проверить что таблицы созданы
4. Реализовать сервис `energy.ts` + написать unit-тест (Vitest)
5. Реализовать роут `GET /api/station` → проверить через curl
6. Реализовать `POST /api/auth/login` → JWT
7. Реализовать `POST /api/events` + SSE-пуш
8. Остальные CRUD-роуты (chests, settings, spin)
9. Cron для затухания
10. Docker Compose → поднять локально, убедиться что всё работает
11. Подключить фронтенд: заменить моковые данные на реальные API-вызовы

---

## Что НЕ нужно делать сейчас

- Деплой на VPS — это Этап 3
- GitHub Actions CI/CD — это Этап 3
- SSL/nginx — это Этап 3

Сосредоточиться только на том, чтобы всё работало локально.
