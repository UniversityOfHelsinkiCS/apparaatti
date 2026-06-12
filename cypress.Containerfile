FROM cypress/browsers:latest

ENV TZ="Europe/Helsinki"

WORKDIR /e2e

copy . .


RUN npm ci
RUN npm install cypress
RUN npx cypress install
CMD ["npx", "cypress", "run", "--browser", "chrome", "--headless"]
