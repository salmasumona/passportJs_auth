# Docker + Docker Compose Guide

This project is now containerized. Docker Compose runs the Node.js/Express application as a production-style container while MongoDB remains in MongoDB Atlas.

## 1. Install Docker

Verify:

```bash
docker --version
docker compose version
```

On Docker Desktop, make sure Docker Engine is running.

## 2. Configure environment variables

```bash
cp .env.docker.example .env
```

Edit `.env` and set:

```env
NODE_ENV=production
HOST=0.0.0.0
PORT=1800
MONGO_URI=mongodb+srv://USERNAME:PASSWORD@YOUR-CLUSTER.mongodb.net/authPassport?retryWrites=true&w=majority
APP_URL=http://localhost:1800
SESSION_SECRET=your-random-secret-at-least-32-characters
```

Never commit `.env`.

Generate a strong secret with:

```bash
openssl rand -base64 48
```

## 3. Build the image

```bash
docker compose build
```

What happens:

```text
Dockerfile
   |
   +--> node:20-bookworm-slim
   |
   +--> npm ci --omit=dev
   |
   +--> application source
   |
   +--> passport-auth image
```

## 4. Start the application

```bash
docker compose up -d
```

Check:

```bash
docker compose ps
docker compose logs -f app
```

Open:

```text
http://localhost:1800
```

Health endpoint:

```bash
curl http://127.0.0.1:1800/health
```

Expected when Atlas is reachable:

```json
{"status":"ok","database":"connected"}
```

## 5. Stop the application

```bash
docker compose down
```

The container is removed; the image remains locally.

## 6. Rebuild after code changes

```bash
docker compose down
docker compose build --no-cache
docker compose up -d
```

Or simply:

```bash
docker compose up -d --build
```

## 7. Useful commands

```bash
docker compose ps
docker compose logs -f app
docker compose restart app
docker compose exec app sh
docker images
docker ps
docker stop passport-auth
docker rm passport-auth
```

## 8. Why HOST=0.0.0.0?

The application used `127.0.0.1` by default. Inside a container, that would only expose the process to the container itself. The application now supports `HOST` and Docker sets it to `0.0.0.0`, allowing Docker's port mapping to reach the app.

Local non-Docker development still defaults to `127.0.0.1`.

## 9. Architecture

```text
Browser
   |
   | http://localhost:1800
   v
Docker Host
   |
   | port mapping 1800:1800
   v
+---------------------------+
| Docker Container          |
|                           |
| Node.js + Express         |
| Passport + Session        |
| Mongoose                  |
+-------------+-------------+
              |
              | MongoDB URI over TLS
              v
       MongoDB Atlas
```

## 10. Docker Compose vs PM2

The project keeps the existing PM2 deployment path for the current EC2 setup. Docker Compose is an additional deployment option.

- PM2 path: Node.js process runs directly on EC2.
- Docker path: Node.js runs inside a container.
- NGINX can remain on the EC2 host and reverse-proxy to `127.0.0.1:1800`.
- Do not run both PM2 and Docker on the same port at the same time.

For a future container-based production deployment, the recommended flow is:

```text
GitHub Actions
     |
     v
Build Docker image
     |
     v
Push to container registry
     |
     v
EC2 pulls image
     |
     v
Docker Compose
     |
     v
NGINX -> Container :1800
```
