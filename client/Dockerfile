# Build stage
# Build stage
FROM node:18-slim AS builder

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install

COPY . .

# Build for web using Expo
RUN npx expo export -p web --output-dir web-build

# Production stage
FROM nginx:alpine

COPY --from=builder /usr/src/app/web-build /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
