# Задание — Тестирование и отладка бэкенда «Космическая Станция Максима»

## Контекст

Бэкенд написан, но работает некорректно. Твоя задача — самостоятельно пройти все сценарии ниже, найти что сломано, починить и убедиться что каждый пункт работает. Не спрашивай подтверждения — тестируй, фикси, двигайся дальше.

---

## Перед началом: запуск среды

Убедись что всё поднято:

```bash
docker-compose up -d
cd server && npm install
npx prisma migrate dev
npx prisma db seed
```

Проверь что сервисы живые:
```bash
docker-compose ps   # все должны быть "Up"
curl http://localhost:3001/api/station   # должен вернуть JSON
```

Если что-то не стартует — смотри логи:
```bash
docker-compose logs server
docker-compose logs postgres
```

Фикси ошибки запуска до начала тестов.

---

## Тест 1 — База данных и seed

**Что проверить:**
```bash
cd server
npx prisma studio   # или прямой SQL:
docker exec -it $(docker-compose ps -q postgres) psql -U station -d station_maksim -c "SELECT role, \"pinHash\" FROM \"User\";"
```

**Ожидаемый результат:** 3 строки — papa, mama, babushka. У каждой есть pinHash (не пустой, хешированный bcrypt).

**Ожидаемый результат для Settings:**
```bash
docker exec -it $(docker-compose ps -q postgres) psql -U station -d station_maksim -c "SELECT * FROM \"Settings\";"
```
Одна строка с id=1, curveK=30, decayCoeff=0.92, thresholdPlus=50, thresholdMinus=-50.

---

## Тест 2 — API станции (публичный)

```bash
curl http://localhost:3001/api/station
```

**Ожидаемый результат:**
```json
{
  "energy": 0,
  "spheres": {
    "study": 5.0,
    "respect": 5.0,
    "focus": 5.0,
    "home": 5.0
  },
  "rewardChest": {
    "status": "locked",
    "daysLeft": null,
    "level": null
  },
  "consequenceChest": {
    "status": "locked",
    "daysLeft": null,
    "level": null
  }
}
```

Если структура другая — привести к этому виду. Фронтенд ожидает именно эти поля.

---

## Тест 3 — Авторизация

### 3а. Успешный вход (Папа, PIN 1111)
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"role": "papa", "pin": "1111"}'
```
**Ожидаемый результат:** `{"token": "eyJ..."}` — JWT строка.

Сохрани токен в переменную для следующих тестов:
```bash
TOKEN=$(curl -s -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"role": "papa", "pin": "1111"}' | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
echo $TOKEN
```

### 3б. Неверный PIN
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"role": "papa", "pin": "9999"}'
```
**Ожидаемый результат:** HTTP 401, тело `{"error": "Invalid PIN"}` или аналог.

### 3в. Мама (PIN 2222) и Бабушка (PIN 3333) — проверить аналогично 3а.

---

## Тест 4 — Добавление события

```bash
curl -X POST http://localhost:3001/api/events \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"sphere": "study", "type": "good", "weight": 10, "comment": "Сделал уроки без напоминаний"}'
```

**Ожидаемый результат:** HTTP 201, тело содержит созданное событие + обновлённый стейт станции.

### Проверить что энергия изменилась:
```bash
curl http://localhost:3001/api/station
```
**Ожидаемый результат:** `energy` теперь не 0, а положительное число (около +9–10 при первом событии +10 баллов).

---

## Тест 5 — Формула энергии

Добавить серию событий и проверить что формула работает правильно (логистическая кривая):

```bash
# Добавить ещё 4 события по +10
for i in 1 2 3 4; do
  curl -s -X POST http://localhost:3001/api/events \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d "{\"sphere\": \"study\", \"type\": \"good\", \"weight\": 10, \"comment\": \"Тест $i\"}" > /dev/null
done

curl http://localhost:3001/api/station | grep energy
```

**Ожидаемый результат:** После 5 событий по +10 (суммарный S=50), энергия E должна быть около **+80** (не +50!). Это доказывает что логистическая кривая работает, а не простое суммирование.

Если energy ≈ 50 — формула неправильная (считает линейно). Нужно починить `energy.ts`.

---

## Тест 6 — Журнал событий

```bash
curl http://localhost:3001/api/events
```

**Ожидаемый результат:** массив объектов, каждый содержит:
```json
{
  "id": 1,
  "sphere": "study",
  "type": "good",
  "weight": 10,
  "comment": "Сделал уроки без напоминаний",
  "author": { "role": "papa" },
  "createdAt": "2026-05-17T..."
}
```

Убедиться что события отсортированы по `createdAt DESC` (новые сверху).

---

## Тест 7 — Удаление события

```bash
# Удалить событие с id=1
curl -X DELETE http://localhost:3001/api/events/1 \
  -H "Authorization: Bearer $TOKEN"
```

**Ожидаемый результат:** HTTP 200. После удаления запросить `/api/station` — энергия должна пересчитаться (стать ниже).

---

## Тест 8 — Сундуки (CRUD)

### Добавить награду:
```bash
curl -X POST http://localhost:3001/api/chests \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"chestType": "reward", "icon": "🎮", "level": 1, "title": "1 час игр"}'
```
**Ожидаемый результат:** HTTP 201, созданный объект.

### Получить список:
```bash
curl http://localhost:3001/api/chests
```
**Ожидаемый результат:** объект с группировкой:
```json
{
  "rewards": {
    "1": [{"id": 1, "icon": "🎮", "title": "1 час игр", "level": 1}],
    "2": [], "3": [], "4": []
  },
  "consequences": {
    "1": [], "2": [], "3": [], "4": []
  }
}
```

### Удалить:
```bash
curl -X DELETE http://localhost:3001/api/chests/1 \
  -H "Authorization: Bearer $TOKEN"
```
**Ожидаемый результат:** HTTP 200.

---

## Тест 9 — Настройки

### Получить настройки:
```bash
curl http://localhost:3001/api/settings \
  -H "Authorization: Bearer $TOKEN"
```
**Ожидаемый результат:** объект Settings с дефолтными значениями.

### Изменить настройку:
```bash
curl -X PUT http://localhost:3001/api/settings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"curveK": 25}'
```
**Ожидаемый результат:** HTTP 200, обновлённый объект Settings с curveK=25.

### Проверить защиту (Мама не должна иметь доступ):
```bash
MAMA_TOKEN=$(curl -s -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"role": "mama", "pin": "2222"}' | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

curl -X PUT http://localhost:3001/api/settings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $MAMA_TOKEN" \
  -d '{"curveK": 10}'
```
**Ожидаемый результат:** HTTP 403.

---

## Тест 10 — SSE (реальное время)

Открыть два терминала одновременно.

**Терминал 1 — подписаться на обновления:**
```bash
curl -N http://localhost:3001/api/sse/station
```
Терминал зависнет — это нормально, он слушает поток.

**Терминал 2 — добавить событие:**
```bash
curl -X POST http://localhost:3001/api/events \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"sphere": "home", "type": "good", "weight": 20, "comment": "SSE тест"}'
```

**Ожидаемый результат:** в Терминале 1 немедленно появится строка:
```
data: {"energy":...,"spheres":{...},"rewardChest":{...},"consequenceChest":{...}}
```

Если ничего не появилось — SSE сломан. Починить `sse.ts`.

---

## Тест 11 — Барабан (spin)

Сначала добавить несколько наград в нужный уровень и набрать энергию чтобы сундук стал доступным.

```bash
# Добавить награду уровня 1
curl -X POST http://localhost:3001/api/chests \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"chestType": "reward", "icon": "🍕", "level": 1, "title": "Пицца"}'

# Прокрутить барабан
curl -X POST http://localhost:3001/api/spin \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"chestType": "reward"}'
```

**Ожидаемый результат:** объект с выпавшей наградой:
```json
{
  "item": {"icon": "🍕", "title": "Пицца", "level": 1},
  "spinId": 1
}
```

---

## Тест 12 — Интеграция с фронтендом

После того как все API-тесты пройдены — проверить что фронтенд реально подключён к бэкенду (не мок):

1. Открыть `http://localhost` в браузере
2. Открыть DevTools → Network → найти запрос к `/api/station`
3. Убедиться что данные приходят с сервера (не из моков)
4. Зайти в `/admin`, войти как Папа (PIN 1111)
5. Добавить событие через форму
6. Переключиться на вкладку с `/` — энергия должна обновиться автоматически без перезагрузки страницы

---

## Итоговый чеклист

После прохождения всех тестов сообщи результат по каждому пункту:

| Тест | Статус | Что было сломано / как починил |
|------|--------|-------------------------------|
| 1. БД и seed | ✅/❌ | |
| 2. GET /api/station | ✅/❌ | |
| 3. Авторизация | ✅/❌ | |
| 4. Добавление события | ✅/❌ | |
| 5. Формула энергии | ✅/❌ | |
| 6. Журнал событий | ✅/❌ | |
| 7. Удаление события | ✅/❌ | |
| 8. Сундуки CRUD | ✅/❌ | |
| 9. Настройки | ✅/❌ | |
| 10. SSE realtime | ✅/❌ | |
| 11. Барабан spin | ✅/❌ | |
| 12. Интеграция фронт+бэк | ✅/❌ | |

Этап 2 считается завершённым только когда все 12 тестов ✅.
