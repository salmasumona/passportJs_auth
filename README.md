# Passport authentication app

An Express application that uses Passport Local and MongoDB for registration, login, sessions, and protected profile pages.

## Run locally

1. Use Node.js 20.19 or newer.
2. Copy `.env.example` to `.env` and set a long, random `SESSION_SECRET`.
3. Start MongoDB, then run `npm install` and `npm start`.
4. Open `http://localhost:1800`.

## Environment variables

- `MONGO_URI` — MongoDB connection string
- `PORT` — HTTP port, defaults to `1800`
- `APP_URL` — public application URL
- `SESSION_SECRET` — session-signing secret
- `NODE_ENV` — set to `production` when deployed
