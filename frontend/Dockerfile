# Build stage
FROM node:18 AS build

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (keeping your working approach)
RUN npm install --legacy-peer-deps

# Copy source code
COPY . .

# Build the Angular application (removing deprecated --prod flag)
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built application from build stage
COPY --from=build /app/dist/smartcity/browser /usr/share/nginx/html

# Copy nginx configuration (using your working path)
COPY nginx.conf /etc/nginx/nginx.conf
COPY entrypoint.sh /entrypoint.sh

# Set permissions and create directories (keeping your working setup)
RUN chmod +x /entrypoint.sh && \
    mkdir -p /tmp/client_temp /tmp/proxy_temp_path /tmp/fastcgi_temp /tmp/uwsgi_temp /tmp/scgi_temp && \
    chmod -R 777 /tmp && \
    mkdir -p /usr/share/nginx/html/assets/config && \
    chmod -R 777 /usr/share/nginx/html/assets/config

ENTRYPOINT ["/entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]

# Keep your original port (though docker-compose maps to 8080 anyway)
EXPOSE 8080