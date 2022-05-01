FROM node:16.15-alpine3.14

WORKDIR /app

RUN apk update && apk add vim bash

RUN npm install -g ts-node
COPY ["package.json", "package-lock.json", "tsconfig.json", "./"]
COPY .esl* .
RUN ls -al
RUN npm install

COPY ./app ./app
CMD npm run start

EXPOSE 8000

