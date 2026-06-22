# Docker Setup for webapp-fms

Static React SPA served by nginx at subpath `/demo/fms/`, with API reverse proxy parity to `vercel.json`.

## Prerequisites

- Docker Desktop (or Docker Engine)
- Network access to API Gateway (presign + list endpoints)

## Build

```bash
docker build -t webapp-fms .
```

Optional build args (match `.env.example` defaults):

```bash
docker build \
  --build-arg VITE_MAX_UPLOAD_BYTES=104857600 \
  --build-arg VITE_UPLOAD_CONCURRENCY=3 \
  -t webapp-fms .
```

`VITE_*` values are baked in at **build time**. Rebuild the image after changing them.

## Run

```bash
docker run --rm -p 8080:80 webapp-fms
```

Open: **http://localhost:8080/demo/fms/**

Root `/` redirects to `/demo/fms/`.

## Verify

```bash
curl -I http://localhost:8080/demo/fms/
curl -s http://localhost:8080/demo/fms/api/files
```

- SPA route should return `200`.
- List proxy should return JSON: `{ "files": [ ... ] }`.

In the browser, test file upload (presign via `/demo/fms/api/upload`, then S3 PUT).

## CORS notes

| Call | Origin | Notes |
|------|--------|-------|
| Presign / list | Same origin (`localhost:8080`) | Proxied by nginx. NO API Gateway browser CORS needed |
| S3 PUT | S3 URL | **S3 bucket CORS** must allow `http://localhost:8080` (and your deploy origin) |

Live API endpoints (dev stage):

- Presign: `POST` `https://yz1zrecbsj.execute-api.ap-southeast-1.amazonaws.com/dev/RnD/webapp/file/upload`
- List: `GET` `https://yz1zrecbsj.execute-api.ap-southeast-1.amazonaws.com/dev/RnD/webapp/file/list`

## Image layout

- Build stage: `node:22-alpine` → `npm ci` → `npm run build` → `dist/`
- Run stage: `nginx:alpine` → `dist/` at `/usr/share/nginx/html/demo/fms`
- Config: `nginx.conf` (SPA fallback + API proxies)
