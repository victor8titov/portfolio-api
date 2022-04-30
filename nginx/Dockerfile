FROM nginx:1.18.0-alpine

RUN apk update && apk add vim bash 
RUN rm /etc/nginx/conf.d/default.conf
COPY default.conf /etc/nginx/conf.d/

ARG PORTFOLIO_API_SERVICE

RUN sed -i "s/PORTFOLIO_API_SERVICE/$PORTFOLIO_API_SERVICE/g" /etc/nginx/conf.d/default.conf

RUN cat /etc/nginx/conf.d/default.conf

EXPOSE 80