# --- Етап 1: Збірка (Builder) ---
FROM node:24-alpine AS builder

WORKDIR /usr/src/app

# Встановлюємо openssl (потрібен лише для генерації клієнта Prisma)
RUN apk add --no-cache openssl

COPY package*.json ./
COPY prisma.config.ts ./
COPY prisma ./prisma/

RUN npm install --loglevel=error

COPY . .

RUN npx prisma generate
RUN npx tsc prisma/seed.ts --skipLibCheck --target es2022 --module commonjs
RUN npm run build

# Видаляємо dev-залежності, щоб полегшити фінальний образ
RUN npm prune --omit=dev

# --- Етап 2: Продакшен (Production) ---
FROM node:24-alpine AS production

WORKDIR /usr/src/app

# Prisma вимагає openssl для роботи з БД у рантаймі
RUN apk add --no-cache openssl

# Забираємо лише готовий код та продакшен-модулі
COPY --from=builder /usr/src/app/package.json ./
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/prisma ./prisma

#  Копіюємо папку з HTML-шаблонами та статику
COPY --from=builder /usr/src/app/views ./views
COPY --from=builder /usr/src/app/public ./public

#  Копіюємо конфіг прізми
COPY --from=builder /usr/src/app/prisma.config.ts ./

EXPOSE 3000

CMD ["node", "dist/src/main.js"]