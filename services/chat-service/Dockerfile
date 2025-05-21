FROM node:18.16-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install --production

COPY . .

# Tạo thư mục logs
RUN mkdir -p logs

# Thiết lập volume cho logs để dễ theo dõi
VOLUME ["/app/logs"]

EXPOSE 5555

# Sử dụng node trực tiếp trong production
CMD ["npm", "run", "start:prod"]
