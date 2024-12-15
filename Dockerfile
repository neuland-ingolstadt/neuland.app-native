# Base stage: Install dependencies and build the project
FROM oven/bun:1 AS bun
WORKDIR /usr/src/app

# Copy necessary files and install dependencies
COPY package.json bun.lockb ./
COPY patches patches 
RUN bun install --ignore-scripts --freeze-lockfile

# Build stage: Use a Node.js image for the build process
FROM node:23 AS build
WORKDIR /usr/src/app

# Copy dependencies and project files
COPY --from=bun /usr/src/app/node_modules ./node_modules
COPY . .

# Build the project
ARG EXPO_PUBLIC_THI_API_KEY
ARG EXPO_PUBLIC_NEULAND_GRAPHQL_ENDPOINT
ARG EXPO_PUBLIC_APTABASE_KEY
ENV EXPO_PUBLIC_THI_API_KEY=${EXPO_PUBLIC_THI_API_KEY}
ENV EXPO_PUBLIC_NEULAND_GRAPHQL_ENDPOINT=${EXPO_PUBLIC_NEULAND_GRAPHQL_ENDPOINT}
ENV EXPO_PUBLIC_APTABASE_KEY=${EXPO_PUBLIC_APTABASE_KEY}
ENV NODE_ENV=production

RUN npx expo export -p web

# Final stage: Serve static files using npx serve
FROM node:23 AS final
WORKDIR /usr/src/app

# Copy the build files
COPY --from=build /usr/src/app/dist ./dist

# Install serve
RUN npm install -g serve

# Expose the port
EXPOSE 3000

# Serve the static files
CMD ["serve", "-s", "dist", "-l", "3000"]