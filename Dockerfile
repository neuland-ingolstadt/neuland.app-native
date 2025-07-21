# Base stage: Install dependencies and build the project using Bun
FROM oven/bun:1 AS bun
WORKDIR /usr/src/app

# Copy necessary files and install dependencies
COPY package.json bun.lock ./
COPY patches patches 
RUN bun install --ignore-scripts --freeze-lockfile

# Build stage: Use a Node.js image for the build process
FROM node:24 AS build
WORKDIR /usr/src/app

# Copy dependencies and project files
COPY --from=bun /usr/src/app/node_modules ./node_modules
COPY . .

# Build the project
ARG EXPO_PUBLIC_THI_API_KEY
ARG EXPO_PUBLIC_NEULAND_GRAPHQL_ENDPOINT
ARG EXPO_PUBLIC_APTABASE_KEY
ARG EXPO_PUBLIC_GIT_COMMIT_HASH
ENV EXPO_PUBLIC_THI_API_KEY=${EXPO_PUBLIC_THI_API_KEY}
ENV EXPO_PUBLIC_NEULAND_GRAPHQL_ENDPOINT=${EXPO_PUBLIC_NEULAND_GRAPHQL_ENDPOINT}
ENV EXPO_PUBLIC_APTABASE_KEY=${EXPO_PUBLIC_APTABASE_KEY}
ENV EXPO_PUBLIC_GIT_COMMIT_HASH=${EXPO_PUBLIC_GIT_COMMIT_HASH}
ENV NODE_ENV=production

RUN npx expo export -p web -c

# Final stage: Serve static files using NGINX
FROM nginx:alpine AS final

COPY --from=build /usr/src/app/dist /usr/share/nginx/html

COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 3000

CMD ["nginx", "-g", "daemon off;"]
