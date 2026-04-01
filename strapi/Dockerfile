FROM node:20-slim

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential gcc autoconf automake libtool \
    libpng-dev libjpeg-dev libwebp-dev libvips-dev \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

EXPOSE 1337

CMD ["npm", "run", "develop"]
