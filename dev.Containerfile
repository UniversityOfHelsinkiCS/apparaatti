FROM docker.io/node:24-alpine

ENV TZ="Europe/Helsinki"
# tzdata might not be installed
RUN apk add --no-cache tzdata

WORKDIR /opt/app-root/src

COPY package* ./
RUN curl -fsSL https://github.com/AikidoSec/safe-chain/releases/latest/download/install-safe-chain.sh | sh -s -- --ci
RUN npm safe-chain-verify
RUN npm ci
EXPOSE 3000

CMD ["npm", "run", "dev"]
