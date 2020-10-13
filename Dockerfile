FROM node:alpine AS build

WORKDIR /app

COPY . .

RUN npm install
RUN npm run publish

FROM node:alpine

WORKDIR /usr/src/app

COPY --from=build /app/dist/docs-client ./

#CMD ["/bin/sh",  "-c",  "envsubst < /usr/share/nginx/html/assets/angular-environment.template.js > /usr/share/nginx/html/assets/angular-environment.js"]
CMD ["none", "main.js"]

EXPOSE 4000
