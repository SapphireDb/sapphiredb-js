FROM node:alpine AS build

WORKDIR /app

COPY . .

RUN npm install
RUN npm run publish

FROM node:alpine

WORKDIR /usr/src/app

COPY --from=build /app/dist/docs-client ./

RUN apk add --no-cache gettext

CMD ["/bin/sh", "-c", "envsubst < ./browser/assets/angular-environment.template.js > ./browser/assets/angular-environment.js && exec node main.js"]

EXPOSE 80
