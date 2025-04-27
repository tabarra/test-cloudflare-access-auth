# Barebones Bun Dockerfile
# For prod, copy https://bun.sh/guides/ecosystem/docker

# prepare the base image
FROM oven/bun:1-alpine
WORKDIR /usr/src/app
COPY . .
RUN bun install --frozen-lockfile

# run the app
USER bun
EXPOSE 3000/tcp
ENTRYPOINT [ "bun", "run", "src/index.ts" ]
