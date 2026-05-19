# Задание — Переработка формулы энергии и сфер

## Суть изменения

Текущая реализация неправильная. Нужно полностью переписать логику расчёта в `server/src/services/energy.ts` и обновить все места где она используется.

---

## Как было (НЕПРАВИЛЬНО — удалить)

```
E = среднее(E_учёба, E_уважение, E_фокус, E_семья)
```

Проблема: событие +50 по учёбе влияло на энергию только на ¼ от реального значения, потому что три другие сферы «размывали» результат.

---

## Как должно быть (ПРАВИЛЬНО — реализовать)

### Принцип: 5 независимых пулов, одна формула

Каждое событие одновременно попадает в **два пула**:
1. **Пул энергии** (`S_total`) — туда идут ВСЕ события без исключения
2. **Пул своей сферы** (`S_study` / `S_respect` / `S_focus` / `S_home`) — только события этой сферы

Пулы полностью независимы. Энергия НЕ зависит от сфер и НЕ является их средним.

### Формула (одна для всех пяти пулов)

```
E = (200 / (1 + e^(−S/k))) − 100
```

- `S` — сумма весов событий за последние 7 дней в данном пуле
- `k` — делитель кривой (из Settings, по умолчанию 30)
- `E` — результат: всегда строго между −100 и +100

### Для отображения сфер — перевод в проценты

```
Сфера% = (E + 100) / 2
```

- E = 0 → 50% (нейтраль, стартовое значение)
- E = +58.7 → 79.4%
- E = −58.7 → 20.6%
- E никогда не достигает ±100, значит % никогда не будет 0 или 100

---

## Правильный код — переписать `energy.ts` полностью

```typescript
// server/src/services/energy.ts

export function calcEnergy(sumS: number, k: number): number {
  // Логистическая кривая: строго между -100 и +100
  const E = (200 / (1 + Math.exp(-sumS / k))) - 100;
  return Math.round(E * 10) / 10;
}

export function calcSpherePercent(sumS: number, k: number): number {
  // Та же кривая, но переведённая в проценты 0–100
  // 0 баллов → 50%, положительные → выше 50%, отрицательные → ниже 50%
  const E = calcEnergy(sumS, k);
  return Math.round(((E + 100) / 2) * 10) / 10;
}

export function sumLastSevenDays(
  events: { weight: number; createdAt: Date; sphere?: string }[],
  sphere?: string // если передана — фильтруем по сфере; если нет — берём все
): number {
  const cutoff = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  return events
    .filter(e => e.createdAt >= cutoff)
    .filter(e => !sphere || e.sphere === sphere)
    .reduce((sum, e) => sum + e.weight, 0);
}
```

---

## Правильный код — переписать расчёт в `station.ts`

```typescript
// server/src/services/station.ts

import { calcEnergy, calcSpherePercent, sumLastSevenDays } from './energy';

export async function getStationState(prisma: PrismaClient) {
  const settings = await prisma.settings.findUnique({ where: { id: 1 } });
  const k = settings?.curveK ?? 30;

  // Все события за последние 7 дней (включая decay-записи)
  const cutoff = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const events = await prisma.event.findMany({
    where: { createdAt: { gte: cutoff } }
  });

  // ПУЛ 1: Энергия — ВСЕ события без фильтра по сфере
  const S_total = sumLastSevenDays(events);
  const energy = calcEnergy(S_total, k);

  // ПУЛЫ 2–5: Каждая сфера — только свои события
  const spheres = {
    study:   calcSpherePercent(sumLastSevenDays(events, 'study'),   k),
    respect: calcSpherePercent(sumLastSevenDays(events, 'respect'), k),
    focus:   calcSpherePercent(sumLastSevenDays(events, 'focus'),   k),
    home:    calcSpherePercent(sumLastSevenDays(events, 'home'),    k),
  };

  // Статусы сундуков — считать на основе energy и streak (логика без изменений)
  const rewardChest = await calcChestStatus('reward', energy, settings, prisma);
  const consequenceChest = await calcChestStatus('consequence', energy, settings, prisma);

  return { energy, spheres, rewardChest, consequenceChest };
}
```

---

## Правильный код — ночное затухание (decay.ts)

Затухание тоже применяется через 5 пулов — отдельно для энергии и отдельно для каждой сферы.

Самый простой способ реализации: добавить одну decay-запись **без сферы** (для энергии) и четыре decay-записи **с каждой сферой** (для сфер). Вес каждой = `-(S_пула * (1 - coeff))`.

```typescript
// jobs/decay.ts

cron.schedule('0 0 * * *', async () => {
  const settings = await prisma.settings.findUnique({ where: { id: 1 } });
  const coeff = settings?.decayCoeff ?? 0.92;
  const events = await prisma.event.findMany({
    where: { createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } }
  });

  const spheres = ['study', 'respect', 'focus', 'home'] as const;

  // Decay для пула энергии (все события)
  const S_total = sumLastSevenDays(events);
  if (S_total !== 0) {
    await prisma.event.create({
      data: {
        sphere: 'system',
        type: 'decay',
        weight: Math.round(S_total * (coeff - 1)),
        authorId: 1, // системный пользователь (Папа или создать отдельного)
        comment: 'Ночное затухание энергии'
      }
    });
  }

  // Decay для каждой сферы отдельно
  for (const sphere of spheres) {
    const S_sphere = sumLastSevenDays(events, sphere);
    if (S_sphere !== 0) {
      await prisma.event.create({
        data: {
          sphere,
          type: 'decay',
          weight: Math.round(S_sphere * (coeff - 1)),
          authorId: 1,
          comment: `Ночное затухание: ${sphere}`
        }
      });
    }
  }
});
```

---

## Проверка что формула работает правильно

После переписки — выполнить эти тесты последовательно:

### Тест 1: Старт (пустая база)
```bash
curl http://localhost:3001/api/station
```
**Ожидаемый результат:**
```json
{ "energy": 0, "spheres": { "study": 50, "respect": 50, "focus": 50, "home": 50 } }
```

### Тест 2: Одно событие +50 по учёбе
```bash
curl -X POST http://localhost:3001/api/events \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"sphere": "study", "type": "good", "weight": 50, "comment": "тест формулы"}'

curl http://localhost:3001/api/station
```
**Ожидаемый результат:**
```json
{
  "energy": 58.7,      // ← НЕ 50! Логистическая кривая даёт 58.7 при S=50, k=30
  "spheres": {
    "study": 79.4,     // (58.7 + 100) / 2 = 79.35
    "respect": 50.0,   // не изменилась
    "focus": 50.0,     // не изменилась
    "home": 50.0       // не изменилась
  }
}
```

### Тест 3: Добавить −30 по семье
```bash
curl -X POST http://localhost:3001/api/events \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"sphere": "home", "type": "bad", "weight": -30, "comment": "тест минус"}'

curl http://localhost:3001/api/station
```
**Ожидаемый результат:**
```json
{
  "energy": 18.5,      // S_total = 50 + (-30) = 20 → E ≈ 18.5 при k=30
  "spheres": {
    "study": 79.4,     // ← НЕ ИЗМЕНИЛАСЬ (событие не касалось учёбы)
    "respect": 50.0,
    "focus": 50.0,
    "home": 35.0       // S_home = -30 → E ≈ -30.5 → % ≈ 34.8
  }
}
```

Если все три теста дают правильные числа — формула работает корректно.

---

## Что обновить на фронтенде

После переписки бэкенда — убедиться что фронтенд корректно отображает данные:

1. **Энергия** (`energy`) — числовое значение от −100 до +100. Показывать как есть (например `+47` или `−12`). Знак плюса добавлять программно для положительных значений.

2. **Сферы** (`spheres.study` и т.д.) — уже в процентах 0–100. На карточках сфер показывать:
   - Число с одним знаком после запятой (например `79.4`)
   - Прогресс-бар: ширина = значение%

3. **Стартовые значения при нулевых событиях:**
   - Энергия = 0
   - Все сферы = 50.0 (50%)
