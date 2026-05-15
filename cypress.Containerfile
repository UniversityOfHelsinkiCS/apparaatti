FROM cypress/browsers:latest

ENV TZ="Europe/Helsinki"

WORKDIR /e2e

copy . .
RUN curl -fsSL https://github.com/AikidoSec/safe-chain/releases/latest/download/install-safe-chain.sh | sh -s -- --ci


RUN npm ci
RUN npm install cypress
RUN npx cypress install
CMD ["npx", "cypress", "run", "--browser", "chrome", "--headless"]
