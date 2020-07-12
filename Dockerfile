FROM node:lts AS builder

WORKDIR /builder

COPY . .

RUN make build

FROM node:lts

WORKDIR /battman

COPY --from=builder /builder/client/build /battman/client/build
COPY --from=builder /builder/server/dist /battman/server/dist
COPY --from=builder /builder/server/package.json /battman/server/package.json

RUN make install-server-production-dependancies

EXPOSE 8080
CMD [ "node", "/battman/server/dist/index.js" ]
