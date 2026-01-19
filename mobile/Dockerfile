FROM node:20-alpine

WORKDIR /app

ENV CHOKIDAR_USEPOLLING=true
ENV NODE_ENV=development

COPY package.json package-lock.json* ./
RUN npm ci --silent

COPY . .

VOLUME ["/app/node_modules"]

EXPOSE 8100

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "8100"]
