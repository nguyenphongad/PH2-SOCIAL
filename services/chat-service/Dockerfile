FROM node:16-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

# Expose port for both HTTP and WebSocket
EXPOSE 5555

CMD ["npm", "start"]
