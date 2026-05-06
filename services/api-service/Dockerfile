FROM node:20-alpine
WORKDIR /app
COPY services/api-service/package.json .
RUN npm install
COPY services/api-service/ .
COPY shared/ /shared/
CMD ["node", "index.js"]