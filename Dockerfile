FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY . .

RUN echo "=== FILES ===" && find /app -name "server.js"

EXPOSE 5000

CMD ["node", "backend/src/server.js"]
