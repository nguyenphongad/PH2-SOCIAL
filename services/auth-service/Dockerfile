FROM node:22

WORKDIR /app

# Copy package.json và package-lock.json
COPY package*.json ./

RUN npm install

# Copy tất cả mã nguồn và file .env vào container
COPY . .

# Expose port dựa trên giá trị trong .env (mặc định là 5000 nếu không có biến môi trường trong code)
EXPOSE 5000

CMD ["npm", "start"]
