# syntax=docker/dockerfile:1

FROM node:18-alpine
ENV NODE_ENV=production
ENV PORT=5001

WORKDIR /app
COPY ./prod/server.js ./server.js
COPY ./prod/app_config.json ./app_config.json
COPY ./dist ./dist
COPY ./_init ./_init

RUN apk add git
RUN yarn install --production

CMD ["node", "server.js"]
EXPOSE 5001
