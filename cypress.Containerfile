FROM cypress/browsers:latest

ENV TZ="Europe/Helsinki"

WORKDIR /e2e
COPY ./ ./
RUN npm install
RUN npm install cypress
RUN npx cypress install
CMD ["npx", "cypress", "run"]
