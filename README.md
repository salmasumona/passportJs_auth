# Modernized Passport.js Authentication

This is an upgraded version of `salmasumona/passportJs_auth`. The original project uses older Express, Mongoose, Passport and session dependencies and stores configuration such as the MongoDB URI and session secret directly in `config.js`. The original server also uses older middleware patterns and does not provide authentication rate limiting or production-oriented session storage.

## What was upgraded

- Node.js 20+ / modern dependency baseline
- Express 5
- Mongoose 8
- Passport 0.7 + Passport Local
- Environment-based configuration with `.env`
- MongoDB-backed sessions with `connect-mongo`
- Secure, HTTP-only session cookie configuration
- Helmet security headers
- Authentication rate limiting
- Async/await error handling
- Password hashing with bcryptjs (12 rounds)
- Generic login errors to reduce account enumeration
- Input validation and normalized username/email
- Graceful SIGINT/SIGTERM shutdown
- Health endpoint: `/health`
- Clean API endpoints: `/api/auth/register`, `/api/auth/login`, `/api/auth/me`, `/api/auth/logout`
- Modern responsive frontend
- Dockerfile + Docker Compose
- GitHub Actions CI
- Basic automated tests and syntax checks

## Run locally

1. Install Node.js 20+ and MongoDB.
2. Copy `.env.example` to `.env` and set `SESSION_SECRET`.
3. Install dependencies:

```bash
npm install
```

4. Start MongoDB.
5. Start the application:

```bash
npm start
```

Open `http://localhost:3000`.

## Docker

```bash
docker compose up --build
```

Then open `http://localhost:3000`.

## Production notes

Set a strong `SESSION_SECRET`, use HTTPS, set `COOKIE_SECURE=true`, and place the app behind a reverse proxy/load balancer. For multi-instance deployments, the MongoDB session store allows sessions to be shared between application instances.

## API

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `POST /api/auth/logout`
- `GET /health`

## Original project

Source: https://github.com/salmasumona/passportJs_auth
