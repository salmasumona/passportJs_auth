# Passport.js Auth — Upgraded

This version upgrades the original Passport.js authentication project **without Docker, Kubernetes, or CI/CD**.

## What was upgraded

- Modern Node.js/Express/Mongoose dependencies
- Environment-based configuration with `.env`
- Stronger session handling with MongoDB-backed sessions
- `httpOnly` + `sameSite` session cookie
- Helmet security headers
- Authentication rate limiting
- Async/await instead of callback-heavy database code
- Password hashing with bcryptjs
- Password minimum length increased to 8
- Username/email normalization and validation
- Generic login errors to reduce account enumeration
- Server-side `/api/me` endpoint
- Proper logout/session destruction
- Health endpoint: `GET /health`
- Central error handling
- Graceful shutdown
- Removed the insecure client-side `loggeduser` cookie dependency
- Removed `node_modules` from the project archive

## Requirements

- Node.js 20+
- MongoDB 6+ (local or hosted)

## Local setup

```bash
npm install
cp .env.example .env
```

Make sure MongoDB is running, then:

```bash
npm test
npm start
```

Open:

```text
http://localhost:1800
```

## Production configuration

Set at least:

```text
NODE_ENV=production
PORT=1800
MONGO_URI=<your-mongodb-connection-string>
APP_URL=https://your-domain.example
SESSION_SECRET=<long-random-secret>
SESSION_SECURE=true
TRUST_PROXY=true
```

If Nginx terminates HTTPS in front of Node.js, `TRUST_PROXY=true` allows Express to correctly understand the original HTTPS request.

## API

### Register

`POST /auth/registration`

```json
{
  "username": "sumona",
  "email": "sumona@example.com",
  "password": "strongpassword",
  "cpassword": "strongpassword"
}
```

### Login

`POST /auth/login`

```json
{
  "username": "sumona",
  "password": "strongpassword"
}
```

### Current user

`GET /api/me`

Requires the authenticated session.

### Logout

`POST /logout`

Destroys the authenticated session.

### Health

`GET /health`

Returns:

```json
{
  "status": "ok"
}
```

## Important security notes

1. Never commit `.env`.
2. Use a strong random `SESSION_SECRET` in production.
3. Use HTTPS in production.
4. Use a managed MongoDB/private network where appropriate.
5. Do not expose MongoDB directly to the public internet.
6. Put Nginx or another reverse proxy in front of Node.js for production.
7. Keep dependencies updated with regular security audits.

This project intentionally does **not** include Docker, Kubernetes, or CI/CD.
