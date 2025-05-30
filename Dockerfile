# Dockerfile for serving prebuilt static files
FROM nginx:alpine

# Copy prebuilt static files
COPY out/ /usr/share/nginx/html/

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
