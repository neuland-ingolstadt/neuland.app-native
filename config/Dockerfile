# Base stage: Install dependencies and build the project using Bun
FROM oven/bun:1@sha256:5ff609364c049b54eb0ff560ec96319729a972078ef2c755d758f0c6ef89c2d6 AS bun
WORKDIR /usr/src/app

# Copy necessary files and install dependencies
COPY package.json bun.lock ./
COPY patches patches 
RUN bun install --ignore-scripts --freeze-lockfile

# Build stage: Use a Node.js image for the build process
FROM node:26@sha256:f5d1cc40abc10c2843339a2134d07817cf33c405cb16bfd052b0ed790254c3a3 AS build
WORKDIR /usr/src/app

# Copy dependencies and project files
COPY --from=bun /usr/src/app/node_modules ./node_modules
COPY . .

# Build the project
ARG EXPO_PUBLIC_THI_API_KEY
ARG EXPO_PUBLIC_NEULAND_AUTHENTIK_CLIENT_ID
ARG EXPO_PUBLIC_NEULAND_GRAPHQL_ENDPOINT
ARG EXPO_PUBLIC_APTABASE_KEY
ARG EXPO_PUBLIC_FLIPT_URL
ARG EXPO_PUBLIC_FLIPT_NAMESPACE
ARG EXPO_PUBLIC_GIT_COMMIT_HASH
ENV EXPO_PUBLIC_THI_API_KEY=${EXPO_PUBLIC_THI_API_KEY}
ENV EXPO_PUBLIC_NEULAND_AUTHENTIK_CLIENT_ID=${EXPO_PUBLIC_NEULAND_AUTHENTIK_CLIENT_ID}
ENV EXPO_PUBLIC_NEULAND_GRAPHQL_ENDPOINT=${EXPO_PUBLIC_NEULAND_GRAPHQL_ENDPOINT}
ENV EXPO_PUBLIC_APTABASE_KEY=${EXPO_PUBLIC_APTABASE_KEY}
ENV EXPO_PUBLIC_FLIPT_URL=${EXPO_PUBLIC_FLIPT_URL}
ENV EXPO_PUBLIC_FLIPT_NAMESPACE=${EXPO_PUBLIC_FLIPT_NAMESPACE}
ENV EXPO_PUBLIC_GIT_COMMIT_HASH=${EXPO_PUBLIC_GIT_COMMIT_HASH}
ENV NODE_ENV=production

RUN npm run licences:bundle && node --experimental-strip-types config/sync-maplibre-worker.ts && npx expo export -p web -c

# Final stage: Serve static files using NGINX
FROM nginx:alpine@sha256:4a73073bd557c65b759505da037898b61f1be6cbcc3c2c3aeac22d2a470c1752 AS final

COPY --from=build /usr/src/app/dist /usr/share/nginx/html

COPY config/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 3000

CMD ["nginx", "-g", "daemon off;"]
