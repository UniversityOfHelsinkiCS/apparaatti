FROM docker.io/node:24-alpine

ENV TZ="Europe/Helsinki"
# tzdata might not be installed
RUN apk add --no-cache tzdata

WORKDIR /opt/app-root/src
COPY .npmrc ./
COPY package* ./
RUN npm config set min-release-age 2 --location=global
RUN npm ci
EXPOSE 3000

CMD ["npm", "run", "dev"]
