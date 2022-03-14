FROM nginx:1.21.0

# Add image info
LABEL org.opencontainers.image.source https://github.com/NCATS-Gamma/qgraph

WORKDIR /app

# make sure all is writeable for the nru USER later on
RUN chmod -R 777 .
RUN chmod -R 777 /etc/nginx
RUN chmod -R 777 /var/cache/nginx
RUN chmod -R 777 /var/log/nginx
RUN touch /var/run/nginx.pid && \
    chmod -R 777 /var/run/nginx.pid

# create a new user and use it.
RUN useradd -M -u 1001 nru
USER nru

# Output rendered templates to /etc/nginx
ENV NGINX_ENVSUBST_OUTPUT_DIR /etc/nginx

COPY json_error.conf /etc/nginx/json_error.conf

# All files with env vars in them need to be put into templates folder so
# envsubst gets called on them automatically.
# envsubst replaces all variables with env values.
# These templates are then output to /etc/nginx
COPY routes.conf /etc/nginx/templates/routes.conf.template
COPY nginx.conf /etc/nginx/templates/nginx.conf.template
