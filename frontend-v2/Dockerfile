FROM node:24-slim AS base

WORKDIR /app

RUN corepack enable

FROM base AS deps

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

FROM deps AS build

COPY . .

ARG VITE_PUBLIC_API_URL
ENV VITE_PUBLIC_API_URL=$VITE_PUBLIC_API_URL

RUN pnpm build

FROM base AS final

WORKDIR /app
ENV NODE_ENV=production

COPY --from=build /app /app

EXPOSE 3000

CMD ["pnpm", "start"]
