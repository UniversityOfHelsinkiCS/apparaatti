FROM docker.io/node:23-alpine

ENV TZ="Europe/Helsinki"

WORKDIR /opt/app-root/src

ARG GIT_SHA
ENV REACT_APP_GIT_SHA=$GIT_SHA

ARG BASE_PATH
ENV PUBLIC_URL=$BASE_PATH

ARG STAGING
ENV STAGING=$STAGING

ARG CI
ENV CI=$CI

COPY package* ./
RUN npm ci --omit-dev --ignore-scripts --no-audit --no-fund
COPY . .

RUN npm run build

EXPOSE 8000

CMD ["npm", "run", "prod"]
