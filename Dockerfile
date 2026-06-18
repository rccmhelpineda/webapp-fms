FROM node:22-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

ARG VITE_MAX_UPLOAD_BYTES=104857600
ARG VITE_UPLOAD_CONCURRENCY=3
ENV VITE_MAX_UPLOAD_BYTES=${VITE_MAX_UPLOAD_BYTES}
ENV VITE_UPLOAD_CONCURRENCY=${VITE_UPLOAD_CONCURRENCY}

RUN npm run build

FROM nginx:1.27-alpine

COPY --from=build /app/dist /usr/share/nginx/html/demo/fms

RUN rm -f /etc/nginx/conf.d/default.conf \
  && printf '%s\n' \
    'server {' \
    '  listen 80;' \
    '  server_name _;' \
    '' \
    '  location = / {' \
    '    return 302 /demo/fms/;' \
    '  }' \
    '' \
    '  location = /demo/fms {' \
    '    return 301 /demo/fms/;' \
    '  }' \
    '' \
    '  location /demo/fms/ {' \
    '    root /usr/share/nginx/html;' \
    '    try_files $uri $uri/ /demo/fms/index.html;' \
    '  }' \
    '}' \
    > /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
