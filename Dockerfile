FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY . .

RUN echo "=== APP STRUCTURE ===" && find /app | sort

EXPOSE 5000

CMD ["node", "backend/src/server.js"]
