# Build stage
FROM node:20-slim AS builder

WORKDIR /usr/src/app

ENV CI=1
ENV NODE_OPTIONS="--max-old-space-size=4096"

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
