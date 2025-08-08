FROM docker.io/node:23-alpine

ENV TZ="Europe/Helsinki"
# tzdata might not be installed
RUN apk add --no-cache tzdata

WORKDIR /opt/app-root/src

COPY package* ./
RUN npm install
EXPOSE 3000

CMD ["npm", "run", "dev"]
