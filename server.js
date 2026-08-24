const http = require("http");
const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const passport = require("passport");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

const config = require("./config");
const User = require("./api/auth/auth.model");
const routes = require("./routes");

const app = express();
const server = http.createServer(app);

if (config.trustProxy) {
  app.set("trust proxy", 1);
}

app.disable("x-powered-by");
app.use(helmet({
  contentSecurityPolicy: false
}));

app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: false, limit: "10kb" }));

app.use(express.static("public", {
  index: false,
  maxAge: config.nodeEnv === "production" ? "1d" : 0
}));

app.use(session({
  name: "auth.sid",
  secret: config.sessionSecret,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: config.mongoUri,
    collectionName: "sessions",
    ttl: 60 * 60 * 24
  }),
  cookie: {
    httpOnly: true,
    secure: config.sessionSecure,
    sameSite: "lax",
    maxAge: 1000 * 60 * 60 * 24,
    ...(config.sessionDomain ? { domain: config.sessionDomain } : {})
  }
}));

app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser((user, done) => done(null, user.id));

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id).select("-password").lean();
    done(null, user || false);
  } catch (error) {
    done(error);
  }
});

routes(app, passport);

app.use((err, req, res, next) => {
  console.error(err);

  if (res.headersSent) return next(err);

  if (err.name === "ValidationError") {
    return res.status(400).json({ message: "Invalid request data." });
  }

  return res.status(500).json({ message: "Internal server error." });
});

async function start() {
  if (!config.sessionSecret) {
    throw new Error("SESSION_SECRET is required in production.");
  }

  await mongoose.connect(config.mongoUri, {
    serverSelectionTimeoutMS: 5000
  });

  await User.init();

  server.listen(config.port, () => {
    console.log(`Server running on ${config.appUrl}`);
  });
}

async function shutdown(signal) {
  console.log(`${signal} received. Shutting down...`);
  server.close(async () => {
    await mongoose.connection.close();
    process.exit(0);
  });
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

process.on("unhandledRejection", (error) => {
  console.error("Unhandled rejection:", error);
});

process.on("uncaughtException", (error) => {
  console.error("Uncaught exception:", error);
  process.exit(1);
});

start().catch((error) => {
  console.error("Startup failed:", error);
  process.exit(1);
});
