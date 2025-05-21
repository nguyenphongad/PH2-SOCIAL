FROM node:22

WORKDIR /app

# Copy package.json và package-lock.json
COPY package*.json ./

RUN npm install

# Copy tất cả mã nguồn và file .env vào container
COPY . .

# Expose port cho Gateway
EXPOSE 9999

CMD ["npm", "start"]
