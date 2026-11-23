# Base stage: Install dependencies and build the project using Bun
FROM oven/bun:1@sha256:3aa040e5445efa09d75bb428a64ba50db13e2b3ac9b6b0c7f145615f62b2ee18 AS bun
WORKDIR /usr/src/app

# Copy necessary files and install dependencies
COPY package.json bun.lock ./
COPY patches patches 
RUN bun install --ignore-scripts --frozen-lockfile

# Build stage: Use a Node.js image for the build process
FROM node:26@sha256:e18c3ccdf7d71619990b0e85639f506e2028a95410999cab24cc373cbd10e0ac AS build
WORKDIR /usr/src/app

# Copy dependencies and project files
COPY --from=bun /usr/src/app/node_modules ./node_modules
COPY . .

# Build the project
ARG EXPO_PUBLIC_THI_API_KEY
ARG EXPO_PUBLIC_NEULAND_AUTHENTIK_CLIENT_ID
ARG EXPO_PUBLIC_NEULAND_CORE_API
ARG EXPO_PUBLIC_NEULAND_FOOD_API
ARG EXPO_PUBLIC_APTABASE_KEY
ARG EXPO_PUBLIC_FEEDBACK_API
ARG EXPO_PUBLIC_FEEDBACK_KEY
ARG EXPO_PUBLIC_FLIPT_URL
ARG EXPO_PUBLIC_FLIPT_NAMESPACE
ARG EXPO_PUBLIC_GIT_COMMIT_HASH
ENV EXPO_PUBLIC_THI_API_KEY=${EXPO_PUBLIC_THI_API_KEY}
ENV EXPO_PUBLIC_NEULAND_AUTHENTIK_CLIENT_ID=${EXPO_PUBLIC_NEULAND_AUTHENTIK_CLIENT_ID}
ENV EXPO_PUBLIC_NEULAND_CORE_API=${EXPO_PUBLIC_NEULAND_CORE_API}
ENV EXPO_PUBLIC_NEULAND_FOOD_API=${EXPO_PUBLIC_NEULAND_FOOD_API}
ENV EXPO_PUBLIC_APTABASE_KEY=${EXPO_PUBLIC_APTABASE_KEY}
ENV EXPO_PUBLIC_FEEDBACK_API=${EXPO_PUBLIC_FEEDBACK_API}
ENV EXPO_PUBLIC_FEEDBACK_KEY=${EXPO_PUBLIC_FEEDBACK_KEY}
ENV EXPO_PUBLIC_FLIPT_URL=${EXPO_PUBLIC_FLIPT_URL}
ENV EXPO_PUBLIC_FLIPT_NAMESPACE=${EXPO_PUBLIC_FLIPT_NAMESPACE}
ENV EXPO_PUBLIC_GIT_COMMIT_HASH=${EXPO_PUBLIC_GIT_COMMIT_HASH}
ENV NODE_ENV=production

RUN npm run licences:bundle && node --experimental-strip-types config/sync-maplibre-worker.ts && npx expo export -p web -c

# Final stage: Serve static files using NGINX
FROM nginx:1.31.9-alpine@sha256:fb4658584bd9a916ffb6f6e365f97c25cfdb2923801f551ea08356e695f14ff7 AS final

COPY --from=build /usr/src/app/dist /usr/share/nginx/html

COPY config/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 3000

CMD ["nginx", "-g", "daemon off;"]
