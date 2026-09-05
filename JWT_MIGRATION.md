# JWT Migration

## What changed

The application has been migrated from Passport session authentication to stateless JWT authentication.

### Removed

- `express-session`
- Passport `serializeUser` / `deserializeUser`
- `req.logIn()` session creation
- `req.isAuthenticated()` route checks
- server-side session storage

### Added

- `jsonwebtoken`
- `middleware/auth.js` JWT verification middleware
- `JWT_SECRET` and `JWT_EXPIRES_IN`
- `GET /auth/me` protected endpoint
- `POST /auth/logout` JWT-cookie logout

## Authentication flow

1. Client submits username/password to `/auth/login`.
2. Passport LocalStrategy validates credentials against MongoDB.
3. The server signs a JWT containing `sub` and `username`.
4. The JWT is returned in the JSON response and stored in an `HttpOnly` `access_token` cookie for the browser UI.
5. Protected API requests can use the cookie automatically or `Authorization: Bearer <JWT>`.
6. The middleware verifies the signature and expiry before allowing access.

## Run locally

```bash
cp .env.example .env
# Set MONGO_URI and JWT_SECRET in .env
npm install
npm run check
npm test
npm start
```

## Run with Docker Compose

```bash
cp .env.docker.example .env
# Set MONGO_URI and JWT_SECRET in .env
docker compose up -d --build
docker compose ps
curl http://127.0.0.1:1800/health
curl http://127.0.0.1:8080/health
```

## API examples

### Login

```bash
curl -i -c cookies.txt \
  -H 'Content-Type: application/json' \
  -d '{"username":"sumona","password":"Password123"}' \
  http://127.0.0.1:1800/auth/login
```

### Current user using the HttpOnly cookie

```bash
curl -i -b cookies.txt http://127.0.0.1:1800/auth/me
```

### Current user using a Bearer token

Copy the `token` value from the login response:

```bash
curl -i \
  -H 'Authorization: Bearer YOUR_JWT_HERE' \
  http://127.0.0.1:1800/auth/me
```

### Logout

```bash
curl -i -b cookies.txt -X POST http://127.0.0.1:1800/auth/logout
```

## Security notes

- Use a long random `JWT_SECRET` (at least 32 characters; preferably generated with a cryptographically secure random generator).
- Do not commit `.env` or real credentials.
- Production cookies are `HttpOnly`, `SameSite=Lax`, and `Secure`.
- JWTs are stateless: logging out clears the browser cookie, but an already-issued Bearer token remains valid until it expires unless a server-side revocation strategy is added.
- For sensitive production systems, use short-lived access tokens and a refresh-token strategy if long-lived sessions are required.
