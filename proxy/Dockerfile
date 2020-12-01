FROM nginx:stable-alpine

# Add image info
LABEL org.opencontainers.image.source https://github.com/NCATS-Gamma/robokop-rewrite

COPY json_error.conf /etc/nginx/json_error.conf
COPY nginx.conf /etc/nginx/nginx.conf
