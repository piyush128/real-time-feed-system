FROM node:20-alpine
WORKDIR /app
COPY services/feed-service/package.json .
RUN npm install
COPY services/feed-service/ .
COPY shared/ /shared/
CMD ["node", "index.js"]