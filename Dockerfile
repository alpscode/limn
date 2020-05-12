FROM python:3.7.7-slim-buster

LABEL maintainer="Sertalp B. Cay <sertalpbilal@gmail.com>"

RUN pip3 install --upgrade pip
RUN pip3 install flask flask_restful flask-cors pillow gevent

COPY ./app /app
COPY ./sample /usermedia
RUN mkdir /tmp/thumbs && mkdir /tmp/cache
WORKDIR /app
EXPOSE 5000

CMD python3 server.py
