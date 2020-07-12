FROM node:lts AS builder
WORKDIR /builder
COPY . .
RUN make build

FROM node:lts
WORKDIR /battman
COPY --from=builder /builder/client/build ./client/build
COPY --from=builder /builder/server/dist ./server/dist
COPY server/package.json ./server/package.json
COPY server/package-lock.json ./server/package-lock.json
COPY Makefile .
RUN make install-server-production-dependancies
# exposed port is only for local, heroku will give a random port with the $PORT env var
EXPOSE 8080
CMD [ "node", "/battman/server/dist/index.js" ]
