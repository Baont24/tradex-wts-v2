FROM nginx:1.14-alpine
COPY nginx/* /etc/nginx/conf.d/
COPY build /usr/share/nginx/html