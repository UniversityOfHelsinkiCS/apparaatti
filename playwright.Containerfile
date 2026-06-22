FROM mcr.microsoft.com/playwright:latest

ENV TZ="Europe/Helsinki"

WORKDIR /e2e

COPY . .

RUN npm ci

CMD ["npx", "playwright", "test"]
