# Docker Compose: NGINX + Node.js

This project runs the application in **two containers**:

```text
Browser
   |
   | http://localhost:8080
   v
+-----------------------+
| NGINX container       |
| host 8080 -> port 80  |
+-----------+-----------+
            |
            | Docker network: app:1800
            v
+-----------------------+
| Node.js container     |
| host 1800 -> port 1800|
+-----------+-----------+
            |
            v
      MongoDB Atlas
```

## Ports

| Component | Container port | Host port | URL |
|---|---:|---:|---|
| NGINX | 80 | 8080 | http://localhost:8080 |
| Node.js | 1800 | 1800 | http://localhost:1800 |

NGINX forwards requests to `http://app:1800`. `app` is the Compose service name, so Docker's internal DNS resolves it automatically.

## 1. Create environment file

```bash
cp .env.docker.example .env
```

Set your MongoDB Atlas URI and a strong JWT secret in `.env`.

## 2. Build both images / start both containers

```bash
docker compose up -d --build
```

## 3. Check containers

```bash
docker compose ps
```

You should see:

```text
passport-auth-app
passport-auth-nginx
```

## 4. Test Node.js directly

```bash
curl http://localhost:1800/health
```

This tests the Node.js container directly.

## 5. Test through NGINX

```bash
curl http://localhost:8080/health
```

This tests the real reverse-proxy path:

```text
Client -> NGINX:8080 -> app:1800 -> Node.js
```

## 6. View logs

NGINX:

```bash
docker compose logs -f nginx
```

Node.js:

```bash
docker compose logs -f app
```

Both:

```bash
docker compose logs -f
```

## 7. Stop containers

```bash
docker compose down
```

## 8. Rebuild after code/config changes

```bash
docker compose down
docker compose up -d --build
```

## Important concept: Docker networking

Do **not** use `localhost:1800` inside the NGINX container. In a container, `localhost` means the NGINX container itself.

Use the Compose service name:

```nginx
proxy_pass http://app:1800;
```

Docker Compose creates a network automatically and provides DNS for service names.

## Why two containers?

NGINX and Node.js have separate responsibilities:

- **NGINX:** reverse proxy, HTTP entry point, headers, TLS later, static files/caching if needed.
- **Node.js:** application logic, Passport authentication, JWT authentications, API/routes.

This separation is closer to a real production architecture and makes it easier to scale or replace either component independently.

## Production note

For local learning, both `8080:80` and `1800:1800` are exposed. In production, you normally expose only NGINX to the public network and keep Node.js reachable only through the Docker network:

```yaml
ports:
  - "8080:80"

# app:
#   no public ports mapping
```

Then NGINX remains the only public entry point.
