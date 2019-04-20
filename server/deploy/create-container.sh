#!/bin/sh

cd ..

cargo build --release --target=x86_64-unknown-linux-musl

docker build -t typeshelp .

docker create \
    --name typeshelp \
    -p 127.0.0.1:9055:8080 \
    --memory=100m --cpu-period="100000" --cpu-quota="25000" \
    -e TH_LISTEN='0.0.0.0:8080' \
    -e TH_DATABASE='/data/comments.db' \
    -e TH_XFF_IP='1' \
    -v /var/lib/typeshelp:/data \
    typeshelp
