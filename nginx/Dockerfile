FROM nginx:1.18.0-alpine

RUN apk update && apk add vim
RUN rm /etc/nginx/conf.d/default.conf
COPY default.conf /etc/nginx/conf.d/

ARG DJANGO_SERVICE
ARG MEDIA_URL
ARG ADMIN_STATIC_URL
ARG ADMIN_STATIC_PATH

RUN sed -i "s/DJANGO_SERVICE/$DJANGO_SERVICE/g" /etc/nginx/conf.d/default.conf
RUN sed -i "s%ADMIN_STATIC_URL%$ADMIN_STATIC_URL%g" /etc/nginx/conf.d/default.conf
RUN sed -i "s%ADMIN_STATIC_PATH%$ADMIN_STATIC_PATH%g" /etc/nginx/conf.d/default.conf
RUN sed -i "s%MEDIA_URL%$MEDIA_URL%g" /etc/nginx/conf.d/default.conf

RUN cat /etc/nginx/conf.d/default.conf

EXPOSE 80