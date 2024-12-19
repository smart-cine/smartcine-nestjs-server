FROM oven/bun:alpine AS base

# STAGE DEPS: Install dependencies only when needed
FROM base AS deps
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
# We need curl and bash to install bun
RUN apk add --no-cache libc6-compat curl bash 
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json bun.lockb* ./
COPY ./prisma/* ./prisma/
RUN curl -fsSL https://bun.sh/install | bash
RUN export BUN_INSTALL="$HOME/.bun" 
RUN export PATH="$BUN_INSTALL/bin:$PATH" 
RUN if [ -f bun.lockb ]; then bun install --frozen-lockfile && bun run prisma:generate; \
  else echo "Lockfile not found." && exit 1; \
  fi


# STAGE BUILDER: Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN if [ -f bun.lockb ]; then bun run build; \
  else echo "Build error" && exit 1; \
  fi


# STAGE RUNNER: Production image, copy all the files and run nestjs server
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist

EXPOSE 9995

ENV PORT 9995

CMD ["node", "dist/main"]
