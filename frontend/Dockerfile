# Stage 1: Build React app
FROM node:20-alpine AS build

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm config set registry https://registry.npmjs.org/
RUN npm config set fetch-timeout 600000
RUN npm config set fetch-retries 5
RUN npm config set fetch-retry-factor 2

RUN npm install

# Copy source code
COPY . .

# Build the React app
RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:alpine

COPY nginx/default.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/build /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
