# Step 1: Build the React Application
FROM node:20-alpine AS build
WORKDIR /app

# Copy dependency configs and install
COPY package*.json ./
RUN npm ci

# Copy source code and compile project
COPY . .
RUN npm run build

# Step 2: Serve the Static Output via Nginx
FROM nginx:alpine

# Copy built bundle to Nginx server html directory
COPY --from=build /app/dist /usr/share/nginx/html

# Expose port 80
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
