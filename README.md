<p align="center">
  <a href="http://nestjs.com/" target="blank">
    <img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" />
  </a>
</p>

<p align="center">
  A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.
</p>

<p align="center">
  <a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
  <a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
  <a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
  <a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
  <a href="https://coveralls.io/github/nestjs/nest?branch=master" target="_blank"><img src="https://coveralls.io/repos/github/nestjs/nest/badge.svg?branch=master#9" alt="Coverage" /></a>
</p>

# FilmsApp (NestJS)

Веб-застосунок для пошуку, перегляду інформації та оцінки фільмів. Проєкт реалізовано з використанням архітектури на базі NestJS, реляційної бази даних PostgreSQL та ORM Prisma.

Як шаблонний рушій для відображення інтерфейсу використовується Handlebars (HBS).

---

## Функціонал

- **Каталог фільмів:** Перегляд списку, детальна інформація, пошук та фільтрація за жанрами.
- **Інтеграція з TMDB API:** Автоматичне отримання та збереження метаданих про фільми.
- **Автентифікація:** Реєстрація та вхід користувачів з використанням JWT (JSON Web Tokens).
- **Взаємодія:**
  - Створення та редагування рецензій.
  - Коментування рецензій.
  - Система оцінювання фільмів.
  - Список «Обране» для користувачів.

---

## Технологічний стек

- **Framework:** NestJS
- **Мова програмування:** TypeScript
- **База даних:** PostgreSQL
- **ORM:** Prisma
- **Template Engine:** Handlebars (hbs)
- **Контейнеризація:** Docker, Docker Compose
- **Тестування:** Jest, Supertest

---

# Налаштування

## Встановлення та запуск (Docker)

### 1. Налаштування змінних оточення

Створіть файл `.env` у кореневій директорії проєкту:

```env
# API Key від TheMovieDB (TMDB)
TMDB_API_KEY=4b6edd71a6834daf5c966f231e3b0efb

# Налаштування JWT
JWT_SECRET=your_super_secret_key1234sdaffasd_5sda2dzc
JWT_EXPIRES_IN=3600

# Налаштування підключення до бази даних у Docker
DATABASE_URL="postgresql://postgres:MyPassword05@postgres:5432/filmsdb?schema=public"
```

### 2. Запуск контейнерів

Виконайте команду для збірки та запуску контейнерів:

```
docker-compose up --build
```

Ця команда виконає наступні дії:

- Створить Docker-образи.

- Запустить контейнер з базою даних PostgreSQL.

- Запустить контейнер із застосунком NestJS.

- Автоматично застосує міграції до бази даних.

- Сервер буде доступний за адресою: http://localhost:3000

### 3. Наповнення бази даних (Seeding)

Для коректної роботи застосунку та наявності тестових даних (користувачі, фільми, рецензії) необхідно виконати скрипт наповнення.

Відкрийте новий термінал та виконайте команду (при запущених контейнерах):

```
docker exec -it my-cinema-app-app-1 npx prisma db seed
```

Примітка: перевірте ім'я контейнера командою `docker ps`, якщо воно відрізняється від my-cinema-app-app-1.

Дані для входу після наповнення:

#### Email:

```
admin@example.com
```

#### Пароль:

```
123456
```

## Локальний запуск (без Docker)

Якщо ви бажаєте запустити проєкт без контейнеризації, використовуючи локально встановлені Node.js та PostgreSQL.

Встановіть залежності:

```
npm install
```

Налаштуйте файл `.env` для вашої локальної бази даних :

```
TMDB_API_KEY=4b6edd71a6834daf5c966f231e3b0efb
JWT_SECRET=your_super_secret_key1234sdaffasd_5sda2dzc
JWT_EXPIRES_IN=3600

Локальне підключення (localhost, порт 5433)
DATABASE_URL="postgresql://postgres:MyPassword05@localhost:5433/NestjsDB?sslmode=prefer&connect_timeout=10"
```

#### Запустіть застосунок:

```
npm run start
```

## Тестування

Проєкт містить Unit та E2E тести.

#### запуск unit тестів

```
npm run test
```

#### запуск e2e тестів

```
npm run test:e2e
```

#### перевірка покриття коду тестами

```
npm run test:cov
```

### Ліцензія

Nest is MIT licensed.
