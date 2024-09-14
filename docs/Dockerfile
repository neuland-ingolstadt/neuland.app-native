# use the official Bun image
# see all versions at https://hub.docker.com/r/oven/bun/tags
FROM oven/bun:1 as base
WORKDIR /usr/src/app

# install dependencies into temp directory
# this will cache them and speed up future builds
FROM base AS install
RUN mkdir -p /temp/dev
COPY package.json bun.lockb /temp/dev/
RUN cd /temp/dev && bun install --frozen-lockfile --ignore-scripts

# install with --production (exclude devDependencies)
RUN mkdir -p /temp/prod
COPY package.json bun.lockb /temp/prod/
RUN cd /temp/prod && bun install --frozen-lockfile --production --ignore-scripts

# copy node_modules from temp directory
# then copy all (non-ignored) project files into the image
FROM base AS prerelease
COPY --from=install /temp/dev/node_modules node_modules
COPY . .
# build the app
RUN bunx vitepress build

# copy production dependencies and source code into final image
FROM base AS release
COPY --chown=bun:bun --from=install /temp/prod/node_modules node_modules
COPY --from=prerelease /usr/src/app/index.mjs .
COPY --from=prerelease /usr/src/app/.vitepress/dist .vitepress/dist

# run the app
USER bun
EXPOSE 8080
ENTRYPOINT [ "bun", "run", "index.mjs" ]