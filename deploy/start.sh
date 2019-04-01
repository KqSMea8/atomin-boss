#!/bin/bash
source /etc/profile

/usr/bin/supervisord

echo "================= 当前环境 =========================="
echo $env

cp -fr /home/xiaoju/workspace/target/nginx.conf /etc/nginx/nginx.conf

echo "================= COPY NGINX CONF =========================="

nginx -g 'daemon off;'

echo "================= NGINX START =========================="
