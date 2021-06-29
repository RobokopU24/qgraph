FROM nginx:1.21.0

# Add image info
LABEL org.opencontainers.image.source https://github.com/NCATS-Gamma/robokop-rewrite

# Output rendered templates to /etc/nginx
ENV NGINX_ENVSUBST_OUTPUT_DIR /etc/nginx

COPY json_error.conf /etc/nginx/json_error.conf

COPY nginx.conf /etc/nginx/templates/nginx.conf.template
